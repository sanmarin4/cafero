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
          category: item.category ? String(item.category).trim().toLowerCase() : '',
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

      // Prepare item data with proper validation
      const itemData = {
        name: String(item.name).trim(),
        description: String(item.description).trim(),
        base_price: Number(item.basePrice),
        category: String(item.category),
        popular: Boolean(item.popular),
        available: Boolean(item.available),
        image_url: item.image ? String(item.image) : null,
        discount_price: item.discountPrice ? Number(item.discountPrice) : null,
        discount_start_date: item.discountStartDate ? String(item.discountStartDate) : null,
        discount_end_date: item.discountEndDate ? String(item.discountEndDate) : null,
        discount_active: Boolean(item.discountActive)
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
          name: String(v.name).trim(),
          price: Number(v.price),
          type: v.type ? String(v.type) : null
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
          name: String(a.name).trim(),
          price: Number(a.price),
          category: String(a.category)
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
    console.log('=== UPDATE MENU ITEM START ===');
    console.log('Item ID:', id);
    console.log('Updates:', updates);

    try {
      // Update menu item
      const itemUpdate = {
        name: updates.name ? String(updates.name).trim() : undefined,
        description: updates.description ? String(updates.description).trim() : undefined,
        base_price: updates.basePrice ? Number(updates.basePrice) : undefined,
        category: updates.category ? String(updates.category) : undefined,
        popular: updates.popular !== undefined ? Boolean(updates.popular) : undefined,
        available: updates.available !== undefined ? Boolean(updates.available) : undefined,
        image_url: updates.image !== undefined ? (updates.image ? String(updates.image) : null) : undefined,
        discount_price: updates.discountPrice !== undefined ? (updates.discountPrice ? Number(updates.discountPrice) : null) : undefined,
        discount_start_date: updates.discountStartDate !== undefined ? (updates.discountStartDate ? String(updates.discountStartDate) : null) : undefined,
        discount_end_date: updates.discountEndDate !== undefined ? (updates.discountEndDate ? String(updates.discountEndDate) : null) : undefined,
        discount_active: updates.discountActive !== undefined ? Boolean(updates.discountActive) : undefined
      };

      // Remove undefined values
      Object.keys(itemUpdate).forEach(key => {
        if (itemUpdate[key as keyof typeof itemUpdate] === undefined) {
          delete itemUpdate[key as keyof typeof itemUpdate];
        }
      });

      console.log('Item update data:', itemUpdate);

      const { error: itemError } = await supabase
        .from('menu_items')
        .update(itemUpdate)
        .eq('id', id);

      if (itemError) {
        console.error('Menu item update error:', itemError);
        throw new Error(`Failed to update menu item: ${itemError.message}`);
      }

      // Delete existing variations and add-ons if we're updating them
      if (updates.variations !== undefined) {
        console.log('=== UPDATING VARIATIONS ===');
        await supabase.from('variations').delete().eq('menu_item_id', id);

        // Insert new variations
        if (updates.variations.length > 0) {
          const variationsData = updates.variations.map(v => ({
            menu_item_id: id,
            name: String(v.name).trim(),
            price: Number(v.price),
            type: v.type ? String(v.type) : null
          }));

          const { error: variationsError } = await supabase
            .from('variations')
            .insert(variationsData);

          if (variationsError) {
            console.error('Variations update error:', variationsError);
            throw new Error(`Failed to update variations: ${variationsError.message}`);
          }
        }
      }

      // Update add-ons if provided
      if (updates.addOns !== undefined) {
        console.log('=== UPDATING ADD-ONS ===');
        await supabase.from('add_ons').delete().eq('menu_item_id', id);

        // Insert new add-ons
        if (updates.addOns.length > 0) {
          const addOnsData = updates.addOns.map(a => ({
            menu_item_id: id,
            name: String(a.name).trim(),
            price: Number(a.price),
            category: String(a.category)
          }));

          const { error: addOnsError } = await supabase
            .from('add_ons')
            .insert(addOnsData);

          if (addOnsError) {
            console.error('Add-ons update error:', addOnsError);
            throw new Error(`Failed to update add-ons: ${addOnsError.message}`);
          }
        }
      }

      console.log('=== UPDATE MENU ITEM COMPLETED SUCCESSFULLY ===');

      // Real-time subscription will handle the UI update
    } catch (err) {
      console.error('=== UPDATE MENU ITEM ERROR ===', err);

      if (err instanceof Error) {
        throw new Error(`Failed to update menu item: ${err.message}`);
      } else {
        throw new Error(`Failed to update menu item: ${String(err)}`);
      }
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