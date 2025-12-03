// const axios = require('axios');

async function testPoints() {
    try {
        const email = `test${Date.now()}@example.com`;
        const password = 'password123';

        // 1. Register
        console.log('Registering...');
        const registerRes = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test User',
                email,
                password,
                role: 'student'
            })
        });
        const registerData = await registerRes.json();

        if (!registerData.success) {
            console.error('Registration failed:', registerData);
            return;
        }
        console.log('Registration successful.');

        // 2. Login
        console.log('Logging in...');
        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email,
                password
            })
        });

        const loginData = await loginRes.json();

        if (!loginData.success) {
            console.error('Login failed:', loginData);
            return;
        }

        const token = loginData.data.token;
        console.log('Login successful. Token obtained.');

        // 3. Add Points
        console.log('Adding 5 points...');
        const pointsRes = await fetch('http://localhost:5000/api/users/add-points', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ points: 5 })
        });

        const pointsData = await pointsRes.json();

        if (pointsData.success) {
            console.log('Points added successfully!');
            console.log('New User Data:', pointsData.data);
        } else {
            console.error('Failed to add points:', pointsData);
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

testPoints();
