// Test script for Conflict of Interest API functionality
// Using built-in fetch (available in Node.js 18+)

async function testConflictOfInterestAPI() {
  console.log('🧪 Testing Conflict of Interest API functionality...');
  
  try {
    // Test data for conflict of interest (using frontend field names)
    const testConflict = {
      individual_name: 'Jane Doe',
      nature_of_interest: 'Volunteer coordinator for external LGBTQ+ organization',
      conflict_type: 'Volunteer Role',
      date_declared: '2024-01-20',
      status: 'Active',
      before_mitigation_risk_level: 'Low',
      residual_risk_level: 'Low',
      position_role: 'Volunteer Coordinator', // Frontend field name
      description: 'Coordinates volunteers for external organization that may collaborate with CT5 Pride', // Frontend field name
      mitigation_actions: 'Will disclose any potential conflicts and recuse from related decisions', // Frontend field name
      monetary_value: 0,
      currency: 'GBP',
      notes: 'Test record created via API to verify functionality',
      review_date: '2024-07-20',
      organisation: 'External LGBTQ+ Organization'
    };
    
    console.log('📝 Test conflict data (frontend format):', testConflict);
    
    // Test the API endpoint
    const response = await fetch('http://localhost:3000/api/conflicts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // This will be handled by requireSupabaseAuth
      },
      body: JSON.stringify(testConflict)
    });
    
    console.log('📡 API Response Status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error Response:', errorText);
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    console.log('✅ API Response:', result);
    
    if (result.success) {
      console.log('🎉 Test passed! Conflict of Interest API is working correctly.');
      console.log('📋 Created conflict ID:', result.conflict.id);
      console.log('👤 Individual:', result.conflict.individual_name);
      console.log('🏢 Organization:', result.conflict.organisation);
      console.log('💰 Monetary Value:', result.conflict.currency, result.conflict.monetary_value);
      console.log('📅 Date Declared:', result.conflict.date_declared);
      console.log('⚠️ Risk Level:', result.conflict.residual_risk_level);
      
      // Test fetching the record
      console.log('\n🔍 Testing GET API functionality...');
      const getResponse = await fetch('http://localhost:3000/api/conflicts', {
        headers: {
          'Authorization': 'Bearer test-token'
        }
      });
      
      if (getResponse.ok) {
        const getResult = await getResponse.json();
        console.log('✅ GET API Response Status:', getResponse.status);
        console.log('📊 Total conflicts in database:', getResult.conflicts?.length || 0);
        
        if (getResult.conflicts && getResult.conflicts.length > 0) {
          const latestConflict = getResult.conflicts[0];
          console.log('📋 Latest conflict details:');
          console.log('  - ID:', latestConflict.id);
          console.log('  - Individual:', latestConflict.individual_name);
          console.log('  - Position/Role:', latestConflict.position_role);
          console.log('  - Description:', latestConflict.description);
          console.log('  - Mitigation Actions:', latestConflict.mitigation_actions);
          console.log('  - Status:', latestConflict.status);
        }
      } else {
        console.error('❌ GET API Error:', await getResponse.text());
      }
      
    } else {
      console.error('❌ API returned success: false');
      console.error('Error message:', result.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 Make sure the server is running on http://localhost:3000');
      console.error('   Run: node server.js');
    }
  }
}

// Run the test
testConflictOfInterestAPI(); 