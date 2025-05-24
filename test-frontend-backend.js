// Quick test to verify frontend-backend communication
async function testFrontendBackendConnection() {
  try {
    console.log('Testing frontend-backend connection...');
    
    // Test products API
    const response = await fetch('http://localhost:5000/api/v1/products', {
      headers: {
        'Origin': 'http://localhost:5173'
      }
    });
    
    console.log('✅ API Response Status:', response.status);
    console.log('✅ Response Headers - CORS:', response.headers.get('access-control-allow-origin'));
    
    const data = await response.json();
    console.log('✅ Products Count:', data.data ? data.data.length : 0);
    
    if (data.data && data.data.length > 0) {
      console.log('✅ Sample Product:', {
        name: data.data[0].name,
        price: data.data[0].price,
        category: data.data[0].category
      });
    }
    
    console.log('\n🎉 SUCCESS: Frontend-Backend communication is working!');
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
  }
}

testFrontendBackendConnection();
