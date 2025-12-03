const API_URL = 'http://localhost:5000/api/auth/register';

const testUser = {
    name: 'Test User',
    email: `testuser_${Date.now()}@example.com`,
    password: 'password123',
    role: 'student'
};

async function testSignup() {
    try {
        console.log('Attempting to register user:', testUser);
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testUser)
        });

        const data = await response.json();

        if (response.ok) {
            console.log('Registration successful:', data);
        } else {
            console.error('Registration failed:', data);
            console.error('Status:', response.status);
        }
    } catch (error) {
        console.error('Network error:', error.message);
    }
}

testSignup();
