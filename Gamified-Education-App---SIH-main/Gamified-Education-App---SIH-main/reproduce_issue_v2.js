const BASE_URL = 'http://127.0.0.1:5000/api';

async function runTest() {
    try {
        // 1. Login as Student One (ID: 3)
        console.log('Logging in...');
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'student1@nexora.com',
                password: 'password123'
            })
        });

        const loginData = await loginRes.json();
        if (!loginRes.ok) throw new Error(`Login failed: ${JSON.stringify(loginData)}`);

        const { token, user } = loginData.data;
        console.log('Login successful. User ID:', user.id);
        console.log('Token:', token);

        // 2. Verify Session (Auth Me)
        console.log('\nVerifying session...');
        const meRes = await fetch(`${BASE_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const meData = await meRes.json();
        if (!meRes.ok) throw new Error(`Auth check failed: ${JSON.stringify(meData)}`);

        console.log('Session verified. User ID from /me:', meData.data.user.id);

        // 3. Start Game
        console.log('\nStarting game...');
        const gameRes = await fetch(`${BASE_URL}/games/start`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                gameType: 'trivia',
                userId: user.id
            })
        });

        const gameData = await gameRes.json();
        if (!gameRes.ok) {
            console.error('Game start failed. Status:', gameRes.status);
            console.error('Response:', gameData);
        } else {
            console.log('Game started successfully:', gameData);
        }

    } catch (error) {
        console.error('\nError occurred:', error.message);
    }
}

runTest();
