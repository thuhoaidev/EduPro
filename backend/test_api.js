const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

// Test function
async function testAPI() {
    try {
        console.log('Testing API endpoints...\n');

        // Test roles endpoint
        console.log('1. Testing roles endpoint...');
        try {
            const rolesResponse = await axios.get(`${API_BASE_URL}/roles`);
            console.log('Roles response:', rolesResponse.data);
        } catch (error) {
            console.error('Roles error:', error.response?.data || error.message);
        }

        // Test users endpoint (should require auth)
        console.log('\n2. Testing users endpoint (without auth)...');
        try {
            const usersResponse = await axios.get(`${API_BASE_URL}/users`);
            console.log('Users response:', usersResponse.data);
        } catch (error) {
            console.log('Users error (expected):', error.response?.status, error.response?.data?.message);
        }

        // Test with auth token (you'll need to get a valid token)
        console.log('\n3. Testing users endpoint with auth...');
        try {
            // First login to get token
            const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
                email: 'admin@example.com',
                password: 'password123'
            });

            if (loginResponse.data.success) {
                const token = loginResponse.data.data.token;
                console.log('Login successful, token:', token.substring(0, 20) + '...');

                // Test users endpoint with token
                const usersResponse = await axios.get(`${API_BASE_URL}/users`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                console.log('Users with auth response:', usersResponse.data);
            }
        } catch (error) {
            console.error('Auth test error:', error.response?.data || error.message);
        }

    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

// Run test
testAPI(); 