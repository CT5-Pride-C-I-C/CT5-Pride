// Cleanup script for test conflict of interest records
const { createClient } = require('@supabase/supabase-js');
const config = require('./config.js');

// Initialize Supabase client
const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);

async function cleanupTestConflicts() {
  console.log('🧹 Cleaning up test conflict of interest records...');
  
  try {
    // Find test records
    const { data: testConflicts, error: fetchError } = await supabase
      .from('conflict_of_interest')
      .select('*')
      .or('individual_name.like.Test User%,notes.like.%test record%')
      .order('created_at', { ascending: false });
    
    if (fetchError) {
      console.error('❌ Error fetching test conflicts:', fetchError);
      throw fetchError;
    }
    
    if (!testConflicts || testConflicts.length === 0) {
      console.log('✅ No test conflicts found to clean up');
      return;
    }
    
    console.log(`📋 Found ${testConflicts.length} test conflicts to clean up:`);
    
    testConflicts.forEach((conflict, index) => {
      console.log(`  ${index + 1}. ${conflict.individual_name} (${conflict.id})`);
    });
    
    // Delete test records
    const { error: deleteError } = await supabase
      .from('conflict_of_interest')
      .delete()
      .or('individual_name.like.Test User%,notes.like.%test record%');
    
    if (deleteError) {
      console.error('❌ Error deleting test conflicts:', deleteError);
      throw deleteError;
    }
    
    console.log('✅ Successfully cleaned up test conflicts');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    });
  }
}

// Run the cleanup
cleanupTestConflicts(); 