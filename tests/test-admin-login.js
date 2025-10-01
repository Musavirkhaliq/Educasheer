import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

// Test admin login and JSON upload
const testAdminLogin = async () => {
  try {
    console.log('🔐 Testing admin login...');
    
    // Login as admin
    const loginResponse = await axios.post('http://localhost:5000/api/v1/users/login', {
      email: 'admin@educasheer.com',
      password: 'educasheer@musa123'
    });
    
    console.log('✅ Admin login successful');
    const { accessToken } = loginResponse.data.data;
    console.log('Token length:', accessToken.length);
    
    // Test JSON upload
    console.log('\n📤 Testing JSON upload...');
    
    const formData = new FormData();
    formData.append('jsonFile', fs.createReadStream('test-questions.json'));
    
    const uploadResponse = await axios.post(
      'http://localhost:5000/api/v1/quizzes/upload-questions',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${accessToken}`
        }
      }
    );
    
    console.log('✅ JSON upload successful');
    console.log('Validated questions:', uploadResponse.data.data.count);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    }
  }
};

testAdminLogin();
