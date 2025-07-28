// Test script for Conflict of Interest functionality
const { createClient } = require('@supabase/supabase-js');

// Load config
const config = require('./config.js');

// Initialize Supabase client
const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);

async function testConflictOfInterest() {
  console.log('🧪 Testing Conflict of Interest functionality...');
  
  try {
    // Test data for conflict of interest
    const testConflict = {
      individual_name: 'John Smith',
      nature_of_interest: 'Board member of external charity organization',
      conflict_type: 'Financial Interest',
      date_declared: '2024-01-15',
      status: 'Active',
      before_mitigation_risk_level: 'Medium',
      residual_risk_level: 'Low',
      role: 'Board Member',
      details: 'Serves as board member for local charity that may receive funding from CT5 Pride',
      mitigation: 'Will recuse from any funding decisions related to this organization',
      monetary_value: 5000.00,
      currency: 'GBP',
      notes: 'Test record created to verify functionality',
      review_date: '2024-07-15',
      organisation: 'Local Charity Foundation'
    };
    
    console.log('📝 Test conflict data:', testConflict);
    
    // Insert test record
    const { data: conflict, error } = await supabase
      .from('conflict_of_interest')
      .insert([testConflict])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error creating test conflict:', error);
      throw error;
    }
    
    console.log('✅ Test conflict created successfully!');
    console.log('📋 Created conflict ID:', conflict.id);
    console.log('👤 Individual:', conflict.individual_name);
    console.log('🏢 Organization:', conflict.organisation);
    console.log('💰 Monetary Value:', conflict.currency, conflict.monetary_value);
    console.log('📅 Date Declared:', conflict.date_declared);
    console.log('⚠️ Risk Level:', conflict.residual_risk_level);
    
    // Test fetching the record
    console.log('\n🔍 Testing fetch functionality...');
    const { data: fetchedConflicts, error: fetchError } = await supabase
      .from('conflict_of_interest')
      .select('*')
      .eq('individual_name', 'John Smith')
      .order('created_at', { ascending: false });
    
    if (fetchError) {
      console.error('❌ Error fetching test conflict:', fetchError);
      throw fetchError;
    }
    
    console.log('✅ Successfully fetched test conflict!');
    console.log('📊 Total conflicts found:', fetchedConflicts.length);
    
    if (fetchedConflicts.length > 0) {
      const fetchedConflict = fetchedConflicts[0];
      console.log('📋 Fetched conflict details:');
      console.log('  - ID:', fetchedConflict.id);
      console.log('  - Individual:', fetchedConflict.individual_name);
      console.log('  - Role:', fetchedConflict.role);
      console.log('  - Details:', fetchedConflict.details);
      console.log('  - Mitigation:', fetchedConflict.mitigation);
      console.log('  - Status:', fetchedConflict.status);
    }
    
    console.log('\n🎉 All tests passed! Conflict of Interest functionality is working correctly.');
    
    // Clean up - delete test record
    console.log('\n🧹 Cleaning up test record...');
    const { error: deleteError } = await supabase
      .from('conflict_of_interest')
      .delete()
      .eq('individual_name', 'John Smith');
    
    if (deleteError) {
      console.error('⚠️ Warning: Could not delete test record:', deleteError);
    } else {
      console.log('✅ Test record cleaned up successfully');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    });
  }
}

// Run the test
testConflictOfInterest(); 