const reproduce = async () => {
    try {
        // 1. Login as teacher
        console.log('Logging in as teacher...');
        const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'teacher1@nexora.com', password: 'teacher123' })
        });
        const loginData = await loginResponse.json();

        if (!loginData.success) {
            console.error('Login failed:', loginData);
            return;
        }

        const token = loginData.data.token;
        console.log('Login successful');

        // 2. Fetch tasks
        console.log('Fetching tasks...');
        const tasksResponse = await fetch('http://localhost:5000/api/tasks', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const tasksData = await tasksResponse.json();

        if (!tasksData.success) {
            console.error('Fetch tasks failed:', tasksData);
            return;
        }

        const tasks = tasksData.data;
        if (tasks.length === 0) {
            console.log('No tasks found to update');
            return;
        }

        const taskToUpdate = tasks[0];
        console.log('First task keys:', Object.keys(taskToUpdate));
        console.log('Has "id" property?', 'id' in taskToUpdate);
        console.log('Has "_id" property?', '_id' in taskToUpdate);

        // 3. Try to update using .id (simulating the bug)
        console.log(`Attempting update with id: ${taskToUpdate.id}`);
        const updateUrl = `http://localhost:5000/api/tasks/${taskToUpdate.id}`;
        console.log(`Update URL: ${updateUrl}`);

        const updateResponse = await fetch(updateUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ ...taskToUpdate, title: taskToUpdate.title + ' (Updated)' })
        });

        const updateData = await updateResponse.json();
        console.log('Update response:', updateData);

    } catch (error) {
        console.error('Error:', error);
    }
};

reproduce();
