// Simple server test
async function testServer() {
  console.log('🧪 Testing server connectivity...');
  
  try {
    // Test basic server response
    const response = await fetch('http://localhost:3000/');
    console.log('📡 Server Response Status:', response.status);
    console.log('📡 Server Response OK:', response.ok);
    
    if (response.ok) {
      console.log('✅ Server is running and responding!');
    } else {
      console.log('⚠️ Server responded but with status:', response.status);
    }
    
  } catch (error) {
    console.error('❌ Server test failed:', error.message);
    console.error('💡 Make sure the server is running: node server.js');
  }
}

testServer(); 