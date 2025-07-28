// Test script for Conflict of Interest functionality through Admin Interface
const puppeteer = require('puppeteer');

async function testAdminConflictOfInterest() {
  console.log('🧪 Testing Conflict of Interest functionality through Admin Interface...');
  
  let browser;
  try {
    // Launch browser
    console.log('🌐 Launching browser...');
    browser = await puppeteer.launch({ 
      headless: false, // Set to true for headless mode
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1280, height: 720 });
    
    // Navigate to admin interface
    console.log('📱 Navigating to admin interface...');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
    
    // Wait for the page to load
    await page.waitForSelector('#app', { timeout: 10000 });
    
    console.log('✅ Admin interface loaded successfully');
    
    // Check if we're on the login page or dashboard
    const currentUrl = page.url();
    console.log('📍 Current URL:', currentUrl);
    
    // Look for login form or dashboard content
    const loginForm = await page.$('input[type="email"]');
    const dashboardContent = await page.$('.admin-content');
    
    if (loginForm) {
      console.log('🔐 Login form detected - need authentication');
      console.log('💡 To test the full functionality, you would need to:');
      console.log('   1. Log in with valid credentials');
      console.log('   2. Navigate to Conflict of Interest section');
      console.log('   3. Create a test record');
      
      // For now, let's just verify the login page loads correctly
      console.log('✅ Login page is accessible');
      
    } else if (dashboardContent) {
      console.log('🎉 Dashboard detected - user is already authenticated');
      
      // Navigate to Conflict of Interest section
      console.log('📋 Navigating to Conflict of Interest section...');
      
      // Look for navigation to conflict register
      const conflictLink = await page.$('a[href="#/conflict-register"]');
      if (conflictLink) {
        await conflictLink.click();
        await page.waitForTimeout(2000);
        
        // Check if conflict register loaded
        const conflictTitle = await page.$('h1');
        if (conflictTitle) {
          const titleText = await page.evaluate(el => el.textContent, conflictTitle);
          console.log('📋 Conflict Register Title:', titleText);
          
          if (titleText.includes('Conflict of Interest')) {
            console.log('✅ Conflict of Interest section loaded successfully');
            
            // Look for "Add New Conflict" button
            const addButton = await page.$('button:contains("Add New Conflict")');
            if (addButton) {
              console.log('✅ Add New Conflict button found');
              
              // Click the button to open the form
              await addButton.click();
              await page.waitForTimeout(1000);
              
              // Check if modal opened
              const modal = await page.$('.modal-dialog');
              if (modal) {
                console.log('✅ Conflict form modal opened');
                
                // Fill in test data
                console.log('📝 Filling in test conflict data...');
                
                await page.type('input[name="individual_name"]', 'Test User');
                await page.type('input[name="nature_of_interest"]', 'Test conflict of interest');
                await page.select('select[name="conflict_type"]', 'Financial Interest');
                await page.select('select[name="status"]', 'Active');
                await page.select('select[name="before_mitigation_risk_level"]', 'Medium');
                await page.select('select[name="residual_risk_level"]', 'Low');
                await page.type('input[name="date_declared"]', '2024-01-20');
                await page.type('input[name="position_role"]', 'Test Role');
                await page.type('textarea[name="description"]', 'Test description of the conflict');
                await page.type('textarea[name="mitigation_actions"]', 'Test mitigation actions');
                await page.type('input[name="monetary_value"]', '1000');
                await page.type('textarea[name="notes"]', 'Test notes for this conflict');
                
                console.log('✅ Test data filled in');
                
                // Submit the form
                console.log('📤 Submitting test conflict...');
                const submitButton = await page.$('button[type="submit"]');
                if (submitButton) {
                  await submitButton.click();
                  await page.waitForTimeout(3000);
                  
                  // Check for success message
                  const successMessage = await page.$('.success-message, .alert-success');
                  if (successMessage) {
                    const messageText = await page.evaluate(el => el.textContent, successMessage);
                    console.log('🎉 Success message:', messageText);
                    console.log('✅ Test conflict created successfully!');
                  } else {
                    console.log('⚠️ No success message found - checking for errors...');
                    
                    // Check for error messages
                    const errorMessage = await page.$('.error-message, .alert-error, .alert-danger');
                    if (errorMessage) {
                      const errorText = await page.evaluate(el => el.textContent, errorMessage);
                      console.log('❌ Error message:', errorText);
                    } else {
                      console.log('ℹ️ No clear success or error message - form may have submitted');
                    }
                  }
                }
              } else {
                console.log('❌ Modal did not open');
              }
            } else {
              console.log('❌ Add New Conflict button not found');
            }
          } else {
            console.log('❌ Conflict of Interest section did not load correctly');
          }
        }
      } else {
        console.log('❌ Conflict of Interest navigation link not found');
      }
    } else {
      console.log('❌ Neither login form nor dashboard content detected');
    }
    
    // Take a screenshot for debugging
    console.log('📸 Taking screenshot...');
    await page.screenshot({ path: 'admin-conflict-test.png', fullPage: true });
    console.log('📸 Screenshot saved as admin-conflict-test.png');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Error details:', error);
  } finally {
    if (browser) {
      console.log('🔒 Closing browser...');
      await browser.close();
    }
  }
}

// Check if puppeteer is available
try {
  require('puppeteer');
  testAdminConflictOfInterest();
} catch (error) {
  console.log('📦 Puppeteer not installed. Installing...');
  console.log('💡 Run: npm install puppeteer');
  console.log('💡 Then run: node test-admin-conflict.js');
  
  // Fallback to simple HTTP test
  console.log('\n🔄 Running simple HTTP test instead...');
  simpleHttpTest();
}

async function simpleHttpTest() {
  console.log('🧪 Simple HTTP test for Conflict of Interest API...');
  
  try {
    // Test the API endpoint directly
    const response = await fetch('http://localhost:3000/api/conflicts', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 API Response Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API is responding');
      console.log('📊 Response:', data);
    } else {
      console.log('⚠️ API responded with status:', response.status);
      const errorText = await response.text();
      console.log('📄 Error response:', errorText);
    }
    
  } catch (error) {
    console.error('❌ HTTP test failed:', error.message);
  }
} 