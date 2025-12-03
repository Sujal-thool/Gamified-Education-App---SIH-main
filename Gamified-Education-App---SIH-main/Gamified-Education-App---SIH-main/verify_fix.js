const verify = async () => {
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
        console.log(`Updating task with _id: ${taskToUpdate._id}`);

        // 3. Update using correct _id (simulating the fix)
        const updateUrl = `http://localhost:5000/api/tasks/${taskToUpdate._id}`;

        const updateResponse = await fetch(updateUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ ...taskToUpdate, title: taskToUpdate.title + ' (Verified)' })
        });

        const updateData = await updateResponse.json();
        console.log('Update response:', updateData);

        if (updateData.success) {
            console.log('VERIFICATION SUCCESSFUL: Task updated.');
        } else {
            console.error('VERIFICATION FAILED: Task update failed.');
        }

    } catch (error) {
        console.error('Error:', error);
    }
};

verify();
