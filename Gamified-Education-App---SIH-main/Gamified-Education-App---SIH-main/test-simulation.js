// const fetch = require('node-fetch'); // Native fetch in Node 18+

const runTest = async () => {
    try {
        // 1. Login
        console.log('Logging in...');
        const loginRes = await fetch('http://localhost:5001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'student1@nexora.com', password: 'student123' })
        });
        const loginData = await loginRes.json();
        if (!loginData.success) {
            console.error('Login failed:', loginData);
            return;
        }
        const token = loginData.data.token;
        console.log('Login successful. Token obtained:', token ? 'Yes' : 'No');

        // 2. Start Simulation
        console.log('\nStarting Simulation...');
        const startRes = await fetch('http://localhost:5001/api/games/simulation/start', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        const startData = await startRes.json();
        console.log('Start Response:', JSON.stringify(startData, null, 2));

        if (!startData.success) {
            console.error('Start Simulation failed');
            return;
        }

        // 3. Play Turn
        console.log('\nPlaying Turn...');
        const turnRes = await fetch('http://localhost:5001/api/games/simulation/turn', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                currentStats: startData.data.stats,
                choice: startData.data.options[0].text
            })
        });
        const turnData = await turnRes.json();
        console.log('Turn Response:', JSON.stringify(turnData, null, 2));

    } catch (error) {
        console.error('Test error:', error);
    }
};

runTest();
