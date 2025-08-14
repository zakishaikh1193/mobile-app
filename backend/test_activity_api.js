const fetch = require('node-fetch');
require('dotenv').config();

async function testActivityAPI() {
  const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';
  
  try {
    console.log('🧪 Testing Activity API...\n');
    
    // First, let's get a list of activities
    console.log('1. Getting activities list...');
    const activitiesResponse = await fetch(`${API_BASE_URL}/activities`);
    const activitiesData = await activitiesResponse.json();
    
    if (!activitiesResponse.ok) {
      console.log('❌ Failed to get activities:', activitiesData);
      return;
    }
    
    console.log('✅ Activities retrieved successfully');
    console.log(`Found ${activitiesData.length} activities`);
    
    if (activitiesData.length === 0) {
      console.log('❌ No activities found to test with');
      return;
    }
    
    // Get the first activity for testing
    const testActivity = activitiesData[0];
    console.log(`\n2. Testing with activity ID: ${testActivity.id} - "${testActivity.title}"`);
    
    // Test updating the activity title
    const updateData = {
      title: `${testActivity.title} (Test Update)`,
      description: testActivity.description || 'Updated description for testing'
    };
    
    console.log('3. Testing activity update...');
    console.log('Update data:', updateData);
    
    const updateResponse = await fetch(`${API_BASE_URL}/activities/${testActivity.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });
    
    const updateResult = await updateResponse.json();
    console.log('Response status:', updateResponse.status);
    console.log('Response body:', updateResult);
    
    if (updateResponse.ok) {
      console.log('✅ Activity update test successful!');
      
      // Verify the update
      console.log('\n4. Verifying the update...');
      const verifyResponse = await fetch(`${API_BASE_URL}/activities/${testActivity.id}`);
      const verifyData = await verifyResponse.json();
      
      if (verifyResponse.ok && verifyData.title === updateData.title) {
        console.log('✅ Update verification successful!');
      } else {
        console.log('❌ Update verification failed');
        console.log('Expected:', updateData.title);
        console.log('Got:', verifyData.title);
      }
      
    } else {
      console.log('❌ Activity update test failed!');
      console.log('Error:', updateResult.error);
    }
    
  } catch (error) {
    console.error('❌ Error testing activity API:', error);
  }
}

testActivityAPI();
