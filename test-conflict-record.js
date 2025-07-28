// Test script to create a conflict of interest record
// This script temporarily bypasses authentication for testing

const { createClient } = require('@supabase/supabase-js');
const config = require('./config.js');

// Initialize Supabase client
const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);

async function createTestConflictRecord() {
  console.log('🧪 Creating test conflict of interest record...');
  
  try {
    // Test data for conflict of interest (using database column names)
    const testConflict = {
      individual_name: 'Test User - Admin Interface',
      nature_of_interest: 'Board member of external charity organization',
      conflict_type: 'Financial Interest',
      date_declared: '2024-01-25',
      status: 'Active',
      before_mitigation_risk_level: 'Medium',
      residual_risk_level: 'Low',
      role: 'Board Member',
      details: 'Serves as board member for local charity that may receive funding from CT5 Pride. This is a test record created to verify the admin interface functionality.',
      mitigation: 'Will recuse from any funding decisions related to this organization and disclose the conflict to all relevant parties.',
      monetary_value: 2500.00,
      currency: 'GBP',
      notes: 'Test record created to verify admin interface functionality. This record can be safely deleted after testing.',
      review_date: '2024-07-25',
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
    console.log('📋 Created conflict details:');
    console.log('  - ID:', conflict.id);
    console.log('  - Individual:', conflict.individual_name);
    console.log('  - Organization:', conflict.organisation);
    console.log('  - Role:', conflict.role);
    console.log('  - Conflict Type:', conflict.conflict_type);
    console.log('  - Status:', conflict.status);
    console.log('  - Risk Level:', conflict.residual_risk_level);
    console.log('  - Monetary Value:', conflict.currency, conflict.monetary_value);
    console.log('  - Date Declared:', conflict.date_declared);
    console.log('  - Created At:', conflict.created_at);
    
    // Test fetching the record to verify it was created
    console.log('\n🔍 Verifying record was created...');
    const { data: fetchedConflicts, error: fetchError } = await supabase
      .from('conflict_of_interest')
      .select('*')
      .eq('individual_name', 'Test User - Admin Interface')
      .order('created_at', { ascending: false });
    
    if (fetchError) {
      console.error('❌ Error fetching test conflict:', fetchError);
      throw fetchError;
    }
    
    console.log('✅ Successfully verified test conflict exists!');
    console.log('📊 Total test conflicts found:', fetchedConflicts.length);
    
    if (fetchedConflicts.length > 0) {
      const latestConflict = fetchedConflicts[0];
      console.log('📋 Latest test conflict details:');
      console.log('  - ID:', latestConflict.id);
      console.log('  - Individual:', latestConflict.individual_name);
      console.log('  - Details:', latestConflict.details);
      console.log('  - Mitigation:', latestConflict.mitigation);
      console.log('  - Notes:', latestConflict.notes);
    }
    
    console.log('\n🎉 Test conflict record created successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Visit http://localhost:3000/ in your browser');
    console.log('   2. Log in with your credentials');
    console.log('   3. Navigate to "Conflict of Interest" section');
    console.log('   4. You should see the test record in the table');
    console.log('   5. Try editing and deleting the test record');
    console.log('\n🧹 To clean up after testing, run: node cleanup-test-conflicts.js');
    
    return conflict;
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    });
  }
}

// Run the test
createTestConflictRecord(); 