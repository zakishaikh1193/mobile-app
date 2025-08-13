const fetch = require('node-fetch');

async function testPuzzleAPI() {
  try {
    console.log('Testing puzzle API endpoint...');
    
    // Test the puzzle endpoint
    const response = await fetch('http://localhost:3000/api/activities/puzzle/12');
    
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Response:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('❌ API Error:');
      console.log(errorText);
    }
    
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

testPuzzleAPI();

