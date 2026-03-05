// Quick Database Setup Test
// Run this in your browser console to check if your database is working

import { supabase } from './src/lib/supabase.js';

async function testDatabaseSetup() {
  console.log('🔍 Testing Database Setup...');

  try {
    // Test 1: Check if tables exist
    console.log('📊 Checking tables...');
    const tables = ['categories', 'menu_items', 'variations', 'add_ons'];

    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
          console.error(`❌ Table '${table}' error:`, error.message);
        } else {
          console.log(`✅ Table '${table}' exists (${data ? data.length : 0} rows found)`);
        }
      } catch (err) {
        console.error(`❌ Table '${table}' failed:`, err.message);
      }
    }

    // Test 2: Check categories
    console.log('🏷️ Checking categories...');
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*');

    if (catError) {
      console.error('❌ Categories error:', catError.message);
    } else {
      console.log(`✅ Found ${categories.length} categories:`, categories.map(c => c.name));
    }

    // Test 3: Try to insert a test item
    console.log('➕ Testing item creation...');
    const testItem = {
      name: 'Test Item - Please Delete',
      description: 'This is a test item to verify database works',
      base_price: 1.00,
      category: categories[0]?.id || 'hot-coffee',
      popular: false,
      available: true
    };

    const { data: newItem, error: insertError } = await supabase
      .from('menu_items')
      .insert(testItem)
      .select()
      .single();

    if (insertError) {
      console.error('❌ Insert test failed:', insertError.message);
    } else {
      console.log('✅ Insert test successful:', newItem.name);

      // Clean up test item
      const { error: deleteError } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', newItem.id);

      if (deleteError) {
        console.warn('⚠️ Could not clean up test item:', deleteError.message);
      } else {
        console.log('🧹 Test item cleaned up');
      }
    }

    console.log('🏁 Database test complete!');

  } catch (error) {
    console.error('💥 Test failed with error:', error);
  }
}

// Make it available globally
window.testDatabaseSetup = testDatabaseSetup;
console.log('💡 Run testDatabaseSetup() to test your database setup');