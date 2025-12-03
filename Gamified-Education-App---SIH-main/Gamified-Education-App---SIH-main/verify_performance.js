const verifyPerformance = async () => {
    try {
        // 1. Login as student
        console.log('Logging in as student...');
        const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'student1@nexora.com', password: 'student123' })
        });
        const loginData = await loginResponse.json();

        if (!loginData.success) {
            console.error('Login failed:', loginData);
            return;
        }

        const token = loginData.data.token;
        const studentId = loginData.data.user.id;
        console.log(`Logged in as student: ${studentId}`);

        // 2. Fetch performance data
        console.log('Fetching performance data...');
        const perfResponse = await fetch('http://localhost:5000/api/students/performance', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const perfData = await perfResponse.json();

        if (!perfData.success) {
            console.error('Fetch performance failed:', perfData);
            return;
        }

        const data = perfData.data;
        console.log(`Received data for ${data.length} students`);

        // 3. Verify data
        // Should only contain 1 student (the logged in one)
        if (data.length === 1 && data[0].id === studentId) {
            console.log('SUCCESS: Only received own data.');
            console.log('Performance Data:', JSON.stringify(data[0], null, 2));
        } else {
            console.error('FAILURE: Received unexpected data.', data);
        }

    } catch (error) {
        console.error('Error:', error);
    }
};

verifyPerformance();
