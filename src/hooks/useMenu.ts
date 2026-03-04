import { useState, useEffect, useRef } from 'react';
import { supabase, deleteImage, supabaseUrl, supabaseAnonKey } from '../lib/supabase';
import { MenuItem } from '../types';
import { menuData } from '../data/menuData';

export const useMenu = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useFallback, setUseFallback] = useState(false);
  const subscriptionRef = useRef<any>(null);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      
      // Fetch menu items with their variations and add-ons
      const { data: items, error: itemsError } = await supabase
        .from('menu_items')
        .select(`
          *,
          variations (*),
          add_ons (*)
        `)
        .order('created_at', { ascending: true });

      if (itemsError) throw itemsError;

      const formattedItems: MenuItem[] = items?.map(item => {
        // Calculate if discount is currently active
        const now = new Date();
        const discountStart = item.discount_start_date ? new Date(item.discount_start_date) : null;
        const discountEnd = item.discount_end_date ? new Date(item.discount_end_date) : null;
        
        const isDiscountActive = item.discount_active && 
          (!discountStart || now >= discountStart) && 
          (!discountEnd || now <= discountEnd);
        
        // Calculate effective price
        const effectivePrice = isDiscountActive && item.discount_price ? item.discount_price : item.base_price;

        return {
          id: item.id,
          name: item.name,
          description: item.description,
          basePrice: item.base_price,
          category: item.category,
          popular: item.popular,
          available: item.available ?? true,
          image: item.image_url || undefined,
          discountPrice: item.discount_price || undefined,
          discountStartDate: item.discount_start_date || undefined,
          discountEndDate: item.discount_end_date || undefined,
          discountActive: item.discount_active || false,
          effectivePrice,
          isOnDiscount: isDiscountActive,
          variations: item.variations?.map(v => ({
            id: v.id,
            name: v.name,
            price: v.price,
            type: v.type || undefined
          })) || [],
          addOns: item.add_ons?.map(a => ({
            id: a.id,
            name: a.name,
            price: a.price,
            category: a.category
          })) || []
        };
      }) || [];

      setMenuItems(formattedItems);
      setUseFallback(false);
      setError(null);
      
      // If no items found in database, use fallback data
      if (formattedItems.length === 0) {
        console.log('No items found in database, using fallback data');
        setMenuItems(menuData);
        setUseFallback(true);
      }
    } catch (err) {
      console.error('Error fetching menu items:', err);
      console.log('Using fallback menu data due to database error');
      setMenuItems(menuData);
      setUseFallback(true);
      setError('Using sample data - database not configured');
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time subscription for menu items
  const setupRealtimeSubscription = () => {
    if (useFallback || !supabase) return;

    try {
      // Subscribe to changes in menu_items table
      subscriptionRef.current = supabase
        .channel('menu_items_changes')
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: 'menu_items'
          },
          (payload) => {
            console.log('Real-time menu update:', payload);
            // Refetch data when changes occur
            fetchMenuItems();
          }
        )
        .subscribe((status) => {
          console.log('Real-time subscription status:', status);
        });
    } catch (error) {
      console.error('Error setting up real-time subscription:', error);
    }
  };

  // Clean up subscription
  const cleanupSubscription = () => {
    if (subscriptionRef.current) {
      supabase.removeChannel(subscriptionRef.current);
      subscriptionRef.current = null;
    }
  };

  const addMenuItem = async (item: Omit<MenuItem, 'id'>) => {
    console.log('=== ADD MENU ITEM START ===');
    console.log('Input item:', item);
    
    try {
      // Check if Supabase is properly configured
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase is not configured. Please check your environment variables.');
      }
      
      console.log('=== INSERTING MENU ITEM ===');
      
      // Insert menu item
      const itemData = {
        name: item.name,
        description: item.description,
        base_price: item.basePrice,
        category: item.category,
        popular: item.popular || false,
        available: item.available ?? true,
        image_url: item.image || null,
        discount_price: item.discountPrice || null,
        discount_start_date: item.discountStartDate || null,
        discount_end_date: item.discountEndDate || null,
        discount_active: item.discountActive || false
      };
      
      console.log('Item data for database:', itemData);
      
      const { data: menuItem, error: itemError } = await supabase
        .from('menu_items')
        .insert(itemData)
        .select()
        .single();

      if (itemError) {
        console.error('Database insert error:', itemError);
        throw new Error(`Database error: ${itemError.message} (Code: ${itemError.code})`);
      }
      
      if (!menuItem) {
        throw new Error('No data returned after insert');
      }
      
      console.log('Menu item inserted successfully:', menuItem);
      
      // Insert variations if any
      if (item.variations && item.variations.length > 0) {
        console.log('=== INSERTING VARIATIONS ===');
        console.log('Variations to insert:', item.variations);
        
        const variationsData = item.variations.map(v => ({
          menu_item_id: menuItem.id,
          name: v.name,
          price: v.price,
          type: v.type || null
        }));
        
        const { error: variationsError } = await supabase
          .from('variations')
          .insert(variationsData);

        if (variationsError) {
          console.error('Variations insert error:', variationsError);
          // Try to cleanup the menu item if variations fail
          await supabase.from('menu_items').delete().eq('id', menuItem.id);
          throw new Error(`Failed to save variations: ${variationsError.message}`);
        }
        
        console.log('Variations inserted successfully');
      }

      // Insert add-ons if any
      if (item.addOns && item.addOns.length > 0) {
        console.log('=== INSERTING ADD-ONS ===');
        console.log('Add-ons to insert:', item.addOns);
        
        const addOnsData = item.addOns.map(a => ({
          menu_item_id: menuItem.id,
          name: a.name,
          price: a.price,
          category: a.category
        }));
        
        const { error: addOnsError } = await supabase
          .from('add_ons')
          .insert(addOnsData);

        if (addOnsError) {
          console.error('Add-ons insert error:', addOnsError);
          // Try to cleanup if add-ons fail
          await supabase.from('menu_items').delete().eq('id', menuItem.id);
          throw new Error(`Failed to save add-ons: ${addOnsError.message}`);
        }
        
        console.log('Add-ons inserted successfully');
      }

      console.log('=== ADD MENU ITEM COMPLETED SUCCESSFULLY ===');
      
      // Real-time subscription will handle the UI update
      return menuItem;
    } catch (err) {
      console.error('=== ADD MENU ITEM ERROR ===', err);
      
      // Enhance error message for better debugging
      if (err instanceof Error) {
        throw new Error(`Failed to add menu item: ${err.message}`);
      } else {
        throw new Error(`Failed to add menu item: ${String(err)}`);
      }
    }
  };

  const updateMenuItem = async (id: string, updates: Partial<MenuItem>) => {
    try {
      // Update menu item
      const { error: itemError } = await supabase
        .from('menu_items')
        .update({
          name: updates.name,
          description: updates.description,
          base_price: updates.basePrice,
          category: updates.category,
          popular: updates.popular,
          available: updates.available,
          image_url: updates.image || null,
          discount_price: updates.discountPrice || null,
          discount_start_date: updates.discountStartDate || null,
          discount_end_date: updates.discountEndDate || null,
          discount_active: updates.discountActive
        })
        .eq('id', id);

      if (itemError) throw itemError;

      // Delete existing variations and add-ons
      await supabase.from('variations').delete().eq('menu_item_id', id);
      await supabase.from('add_ons').delete().eq('menu_item_id', id);

      // Insert new variations
      if (updates.variations && updates.variations.length > 0) {
        const { error: variationsError } = await supabase
          .from('variations')
          .insert(
            updates.variations.map(v => ({
              menu_item_id: id,
              name: v.name,
              price: v.price,
              type: v.type || null
            }))
          );

        if (variationsError) throw variationsError;
      }

      // Insert new add-ons
      if (updates.addOns && updates.addOns.length > 0) {
        const { error: addOnsError } = await supabase
          .from('add_ons')
          .insert(
            updates.addOns.map(a => ({
              menu_item_id: id,
              name: a.name,
              price: a.price,
              category: a.category
            }))
          );

        if (addOnsError) throw addOnsError;
      }

      // Real-time subscription will handle the UI update
    } catch (err) {
      console.error('Error updating menu item:', err);
      throw err;
    }
  };

  const deleteMenuItem = async (id: string) => {
    try {
      // First, get the item to find the image URL
      const { data: item, error: fetchError } = await supabase
        .from('menu_items')
        .select('image_url')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Delete the item from database
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Delete associated image from storage if it exists
      if (item?.image_url) {
        try {
          await deleteImage(item.image_url);
        } catch (imageError) {
          console.error('Error deleting image:', imageError);
          // Don't fail the entire deletion if image deletion fails
        }
      }

      // No need to call fetchMenuItems() here since real-time subscription will handle it
    } catch (err) {
      console.error('Error deleting menu item:', err);
      throw err;
    }
  };

  useEffect(() => {
    // Initial data fetch
    fetchMenuItems().then(() => {
      // Set up real-time subscription after initial fetch
      if (!useFallback) {
        setupRealtimeSubscription();
      }
    });

    // Cleanup subscription on unmount
    return () => {
      cleanupSubscription();
    };
  }, [useFallback]);

  return {
    menuItems,
    loading,
    error,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    refetch: fetchMenuItems,
    useFallback
  };
};