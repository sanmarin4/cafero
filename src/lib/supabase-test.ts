// Supabase Connection Tester
// Use this in the browser console to debug your setup

import { supabase } from './supabase';

export const testSupabaseConnection = async () => {
  console.log('🔍 Testing Supabase Connection...');
  
  // Test 1: Environment Variables
  console.log('📋 Environment Variables:');
  console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
  console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'MISSING');
  
  // Test 2: Database Connection
  console.log('🔗 Testing Database Connection...');
  try {
    const { data, error } = await supabase.from('categories').select('*').limit(1);
    if (error) {
      console.error('❌ Database Error:', error);
    } else {
      console.log('✅ Database Connected:', data);
    }
  } catch (err) {
    console.error('❌ Database Connection Failed:', err);
  }
  
  // Test 3: Storage Connection
  console.log('📁 Testing Storage Connection...');
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) {
      console.error('❌ Storage Error:', error);
    } else {
      console.log('✅ Storage Connected. Buckets:', buckets.map(b => b.name));
    }
  } catch (err) {
    console.error('❌ Storage Connection Failed:', err);
  }
  
  // Test 4: Check Tables
  console.log('📊 Testing Required Tables...');
  const tables = ['categories', 'menu_items', 'variations', 'add_ons'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        console.error(`❌ Table '${table}' Error:`, error);
      } else {
        console.log(`✅ Table '${table}' OK (${data.length} rows tested)`);
      }
    } catch (err) {
      console.error(`❌ Table '${table}' Failed:`, err);
    }
  }
  
  // Test 5: Test Insert Operation (to check RLS policies)
  console.log('🔒 Testing Insert Permissions...');
  try {
    const testCategory = {
      id: `test-${Date.now()}`,
      name: 'Test Category',
      icon: '🧪',
      sort_order: 999
    };
    
    const { data, error } = await supabase
      .from('categories')
      .insert(testCategory)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Insert Permission Error:', error);
    } else {
      console.log('✅ Insert Permission OK:', data);
      
      // Clean up test data
      await supabase.from('categories').delete().eq('id', testCategory.id);
      console.log('🧹 Test data cleaned up');
    }
  } catch (err) {
    console.error('❌ Insert Permission Test Failed:', err);
  }
  
  console.log('🏁 Test Complete');
};

// Create a simple test for menu item operations
export const testMenuOperations = async () => {
  console.log('🍽️ Testing Menu Operations...');
  
  try {
    // Test adding a menu item
    const testItem = {
      name: 'Test Coffee',
      description: 'A test coffee item',
      base_price: 4.99,
      category: 'hot-coffee',
      popular: false,
      available: true
    };
    
    console.log('➕ Testing Add Menu Item...');
    const { data: newItem, error: addError } = await supabase
      .from('menu_items')
      .insert(testItem)
      .select()
      .single();
    
    if (addError) {
      console.error('❌ Add Item Error:', addError);
      return;
    }
    
    console.log('✅ Item Added:', newItem);
    
    // Test updating the item
    console.log('✏️ Testing Update Menu Item...');
    const { data: updatedItem, error: updateError } = await supabase
      .from('menu_items')
      .update({ name: 'Updated Test Coffee' })
      .eq('id', newItem.id)
      .select()
      .single();
    
    if (updateError) {
      console.error('❌ Update Item Error:', updateError);
    } else {
      console.log('✅ Item Updated:', updatedItem);
    }
    
    // Test deleting the item
    console.log('🗑️ Testing Delete Menu Item...');
    const { error: deleteError } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', newItem.id);
    
    if (deleteError) {
      console.error('❌ Delete Item Error:', deleteError);
    } else {
      console.log('✅ Item Deleted Successfully');
    }
    
  } catch (err) {
    console.error('❌ Menu Operations Test Failed:', err);
  }
  
  console.log('🏁 Menu Operations Test Complete');
};

// Auto-run when imported in console
if (typeof window !== 'undefined') {
  window.testSupabaseConnection = testSupabaseConnection;
  window.testMenuOperations = testMenuOperations;
  console.log('💡 Available test functions:');
  console.log('   - testSupabaseConnection() - Comprehensive connection test');
  console.log('   - testMenuOperations() - Test CRUD operations');
}