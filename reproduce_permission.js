const reproducePermission = async () => {
    try {
        // 1. Login as teacher
        console.log('Logging in as teacher...');
        const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'teacher1@nexora.com', password: 'teacher123' })
        });
        const loginData = await loginResponse.json();
        const token = loginData.data.token;
        const teacherId = loginData.data.user.id;
        console.log(`Logged in as teacher: ${teacherId}`);

        // 2. Fetch tasks
        console.log('Fetching tasks...');
        const tasksResponse = await fetch('http://localhost:5000/api/tasks', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const tasksData = await tasksResponse.json();
        const tasks = tasksData.data;

        // 3. Find a task NOT created by this teacher
        const otherTask = tasks.find(t => t.createdBy._id !== teacherId);

        if (!otherTask) {
            console.log('Could not find a task created by someone else.');
            return;
        }

        console.log(`Found task created by ${otherTask.createdBy.name} (${otherTask.createdBy._id})`);
        console.log(`Task ID: ${otherTask._id}`);

        // 4. Try to update it
        console.log('Attempting to update...');
        const updateResponse = await fetch(`http://localhost:5000/api/tasks/${otherTask._id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ ...otherTask, title: otherTask.title + ' (Hacked)' })
        });

        const updateData = await updateResponse.json();
        console.log('Update response:', updateData);

        if (updateResponse.status === 403) {
            console.log('CONFIRMED: Permission denied (403).');
        } else if (updateResponse.ok) {
            console.log('UNEXPECTED: Update succeeded.');
        } else {
            console.log(`Failed with status ${updateResponse.status}`);
        }

    } catch (error) {
        console.error('Error:', error);
    }
};

reproducePermission();
