const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
require('dotenv').config({ path: './config.env' });

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mock data for demo
// Mock data for demo - PERSISTED
const DATA_FILE = path.join(__dirname, 'users-data.json');
let mockUsers = [];

// Load users from file
try {
  if (fs.existsSync(DATA_FILE)) {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    mockUsers = JSON.parse(data);
    console.log(`Loaded ${mockUsers.length} users from ${DATA_FILE}`);
  } else {
    // Initial data if file doesn't exist
    mockUsers = [
      {
        id: '1',
        name: 'Admin User',
        email: 'admin@nexora.com',
        role: 'admin',
        points: 0,
        badges: []
      },
      {
        id: '2',
        name: 'Teacher One',
        email: 'teacher1@nexora.com',
        role: 'teacher',
        points: 0,
        badges: []
      },
      {
        id: '3',
        name: 'Student One',
        email: 'student1@nexora.com',
        role: 'student',
        points: 150,
        badges: [
          { name: 'Eco Warrior', description: 'Completed 5 environmental tasks' },
          { name: 'Quiz Master', description: 'Scored 90% or higher on 3 quizzes' }
        ],
        streak: 5,
        lastStreakDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        gameHistory: {}
      }
    ];
    saveUsers();
  }
} catch (err) {
  console.error('Error loading users data:', err);
  mockUsers = [];
}

function saveUsers() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(mockUsers, null, 2));
    console.log('Users data saved.');
  } catch (err) {
    console.error('Error saving users data:', err);
  }
}

const mockTasks = [];

const mockQuizzes = [
  {
    id: '1',
    title: 'Climate Change Basics',
    description: 'Test your knowledge about climate change and its impacts on our planet.',
    category: 'climate',
    points: 25,
    timeLimit: 15,
    createdBy: { name: 'Teacher One', email: 'teacher1@nexora.com' },
    questions: [
      {
        question: 'What is the primary cause of global warming?',
        options: ['Solar radiation', 'Greenhouse gases', 'Ocean currents', 'Volcanic activity'],
        correctAnswer: 1,
        explanation: 'Greenhouse gases trap heat in the atmosphere, causing global warming.'
      },
      {
        question: 'Which gas is the most significant contributor to the greenhouse effect?',
        options: ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Argon'],
        correctAnswer: 2,
        explanation: 'Carbon dioxide is the most significant greenhouse gas contributing to climate change.'
      }
    ]
  }
];

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Nexora API is running (Demo Mode)',
    timestamp: new Date().toISOString(),
    mode: 'demo'
  });
});

// Auth routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  const user = mockUsers.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Check password - either stored password or default demo passwords
  const validPassword = user.password === password ||
    (password === 'admin123' && user.role === 'admin') ||
    (password === 'teacher123' && user.role === 'teacher') ||
    (password === 'student123' && user.role === 'student');

  if (!validPassword) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      token: 'demo-token-' + user.id,
      user: user
    }
  });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password, role = 'student' } = req.body;

  // Check if user already exists
  const existingUser = mockUsers.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User already exists with this email'
    });
  }

  const newUser = {
    id: (mockUsers.length + 1).toString(),
    name,
    email,
    password, // Store the password for login
    role,
    points: 0,
    badges: []
  };

  mockUsers.push(newUser);
  saveUsers(); // Save to file

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      token: 'demo-token-' + newUser.id,
      user: newUser
    }
  });
});

app.get('/api/auth/me', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }

  const userId = token.replace('demo-token-', '');
  const user = mockUsers.find(u => u.id === userId);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  res.json({
    success: true,
    data: { user }
  });
});

// Users routes
app.get('/api/users', (req, res) => {
  res.json({
    success: true,
    count: mockUsers.length,
    data: mockUsers
  });
});

app.get('/api/users/students', (req, res) => {
  const students = mockUsers.filter(u => u.role === 'student');
  res.json({
    success: true,
    count: students.length,
    data: students
  });
});

app.get('/api/users/leaderboard', (req, res) => {
  const students = mockUsers
    .filter(u => u.role === 'student')
    .sort((a, b) => b.points - a.points)
    .slice(0, 10);

  res.json({
    success: true,
    data: students
  });
});

app.put('/api/users/add-points', (req, res) => {
  const { points } = req.body;
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ success: false, message: 'No token' });

  const userId = token.replace('demo-token-', '');
  const user = mockUsers.find(u => u.id === userId);

  if (user) {
    user.points = (user.points || 0) + points;
    saveUsers(); // Save to file
    res.json({ success: true, data: user });
  } else {
    res.status(404).json({ success: false, message: 'User not found' });
  }
});

app.delete('/api/users/:id', (req, res) => {
  console.log('Delete request for user ID:', req.params.id);
  console.log('Available user IDs:', mockUsers.map(u => u.id));

  const userIndex = mockUsers.findIndex(u => u.id.toString() === req.params.id.toString());
  if (userIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  mockUsers.splice(userIndex, 1);

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
});

// Tasks routes
app.get('/api/tasks', (req, res) => {
  res.json({
    success: true,
    count: mockTasks.length,
    data: mockTasks
  });
});

app.get('/api/tasks/my-tasks', (req, res) => {
  res.json({
    success: true,
    count: mockTasks.length,
    data: mockTasks
  });
});

app.post('/api/tasks', upload.single('resourceFile'), (req, res) => {
  const { title, description, category, points, difficulty, dueDate } = req.body;
  const file = req.file;

  const newTask = {
    id: (mockTasks.length + 1).toString(),
    title,
    description,
    category,
    points: parseInt(points),
    difficulty: difficulty || 'easy',
    dueDate,
    resourceFile: file ? {
      filename: file.filename,
      path: 'uploads/' + file.filename,
      mimetype: file.mimetype
    } : null,
    createdAt: new Date().toISOString(),
    createdBy: 'demo-user',
    submissions: []
  };

  mockTasks.push(newTask);

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: newTask
  });
});

app.put('/api/tasks/:id', (req, res) => {
  const { title, description, category, points, difficulty, dueDate } = req.body;

  const taskIndex = mockTasks.findIndex(t => t.id === req.params.id);
  if (taskIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  // Update task
  mockTasks[taskIndex] = {
    ...mockTasks[taskIndex],
    title,
    description,
    category,
    points: parseInt(points),
    difficulty,
    dueDate: new Date(dueDate),
    updatedAt: new Date().toISOString()
  };

  res.json({
    success: true,
    message: 'Task updated successfully',
    data: mockTasks[taskIndex]
  });
});

app.delete('/api/tasks/:id', (req, res) => {
  const taskIndex = mockTasks.findIndex(t => t.id === req.params.id);
  if (taskIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  mockTasks.splice(taskIndex, 1);

  res.json({
    success: true,
    message: 'Task deleted successfully'
  });
});

app.post('/api/tasks/:id/submit', upload.single('file'), (req, res) => {
  const taskId = req.params.id;
  const { description, studentId } = req.body;
  const file = req.file;

  console.log('Submission received:', { taskId, description, studentId, file });

  const task = mockTasks.find(t => t.id === taskId);
  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  // Check if student has already submitted this task
  if (!task.submissions) {
    task.submissions = [];
  }

  const existingSubmission = task.submissions.find(sub => sub.student === studentId);
  if (existingSubmission) {
    return res.status(400).json({
      success: false,
      message: 'You have already submitted this task'
    });
  }

  const submission = {
    id: Date.now().toString(),
    student: studentId, // Use actual student ID
    description,
    file: file ? {
      filename: file.filename,
      path: 'uploads/' + file.filename, // Store relative path for serving
      mimetype: file.mimetype
    } : null,
    status: 'pending',
    submittedAt: new Date().toISOString()
  };

  task.submissions.push(submission);

  res.status(201).json({
    success: true,
    message: 'Task submitted successfully',
    data: submission
  });
});

// Quizzes routes
app.get('/api/quizzes', (req, res) => {
  res.json({
    success: true,
    count: mockQuizzes.length,
    data: mockQuizzes
  });
});

app.get('/api/quizzes/my-quizzes', (req, res) => {
  res.json({
    success: true,
    count: mockQuizzes.length,
    data: mockQuizzes
  });
});

app.post('/api/quizzes', (req, res) => {
  const { title, description, category, points, timeLimit, questions } = req.body;

  const newQuiz = {
    id: (mockQuizzes.length + 1).toString(),
    title,
    description,
    category,
    points: parseInt(points),
    timeLimit: parseInt(timeLimit),
    questions,
    createdAt: new Date().toISOString(),
    createdBy: 'demo-user',
    attempts: []
  };

  mockQuizzes.push(newQuiz);

  res.status(201).json({
    success: true,
    message: 'Quiz created successfully',
    data: newQuiz
  });
});

app.put('/api/quizzes/:id', (req, res) => {
  const { title, description, category, points, timeLimit, questions } = req.body;

  const quizIndex = mockQuizzes.findIndex(q => q.id === req.params.id);
  if (quizIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Quiz not found'
    });
  }

  // Update quiz
  mockQuizzes[quizIndex] = {
    ...mockQuizzes[quizIndex],
    title,
    description,
    category,
    points: parseInt(points),
    timeLimit: parseInt(timeLimit),
    questions,
    updatedAt: new Date().toISOString()
  };

  res.json({
    success: true,
    message: 'Quiz updated successfully',
    data: mockQuizzes[quizIndex]
  });
});

app.delete('/api/quizzes/:id', (req, res) => {
  const quizIndex = mockQuizzes.findIndex(q => q.id === req.params.id);
  if (quizIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Quiz not found'
    });
  }

  mockQuizzes.splice(quizIndex, 1);

  res.json({
    success: true,
    message: 'Quiz deleted successfully'
  });
});

app.post('/api/quizzes/submit', (req, res) => {
  const { quizId, answers, timeTaken, studentId } = req.body;

  const quiz = mockQuizzes.find(q => q.id === quizId);
  if (!quiz) {
    return res.status(404).json({
      success: false,
      message: 'Quiz not found'
    });
  }

  // Check if student has already attempted this quiz
  if (!quiz.attempts) {
    quiz.attempts = [];
  }

  const existingAttempt = quiz.attempts.find(attempt => attempt.student === studentId);
  if (existingAttempt) {
    return res.status(400).json({
      success: false,
      message: 'You have already completed this quiz'
    });
  }

  // Calculate score
  let correctAnswers = 0;
  if (quiz.questions && answers) {
    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });
  }

  const score = quiz.questions ? Math.round((correctAnswers / quiz.questions.length) * 100) : 0;
  const pointsEarned = Math.round((score / 100) * quiz.points);

  const attempt = {
    id: Date.now().toString(),
    student: studentId, // Use actual student ID
    answers,
    score,
    correctAnswers,
    totalQuestions: quiz.questions ? quiz.questions.length : 0,
    pointsEarned,
    timeTaken,
    completedAt: new Date().toISOString()
  };

  quiz.attempts.push(attempt);

  // Update correct student points
  const student = mockUsers.find(u => u.id === studentId);
  if (student) {
    student.points = (student.points || 0) + pointsEarned;
    saveUsers(); // Save to file
  }

  res.status(201).json({
    success: true,
    message: 'Quiz submitted successfully',
    data: attempt
  });
});

// Task review route for teachers
app.put('/api/tasks/:id/review', (req, res) => {
  const { submissionId, status, feedback, pointsAwarded } = req.body;
  const taskId = req.params.id;

  const task = mockTasks.find(t => t.id === taskId);
  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  const submission = task.submissions.find(s => s.id === submissionId);
  if (!submission) {
    return res.status(404).json({
      success: false,
      message: 'Submission not found'
    });
  }

  // Update submission
  submission.status = status;
  submission.feedback = feedback;
  submission.pointsAwarded = pointsAwarded || 0;
  submission.reviewedAt = new Date().toISOString();

  // Update student points if approved
  if (status === 'approved' && pointsAwarded > 0) {
    const student = mockUsers.find(u => u.id === submission.studentId);
    if (student) {
      student.points = (student.points || 0) + pointsAwarded;
      saveUsers(); // Save to file
    }
  }

  res.json({
    success: true,
    message: 'Submission reviewed successfully',
    data: submission
  });
});

// Student performance route
app.get('/api/students/performance', (req, res) => {
  const studentsPerformance = mockUsers
    .filter(user => user.role === 'student')
    .map(student => {
      // Get task submissions for this student
      const taskSubmissions = [];
      mockTasks.forEach(task => {
        if (task.submissions) {
          const studentSubmission = task.submissions.find(sub => sub.student === student.id);
          if (studentSubmission) {
            taskSubmissions.push({
              taskId: task.id,
              taskTitle: task.title,
              status: studentSubmission.status,
              pointsAwarded: studentSubmission.pointsAwarded || 0,
              submittedAt: studentSubmission.submittedAt
            });
          }
        }
      });

      // Get quiz attempts for this student
      const quizAttempts = [];
      mockQuizzes.forEach(quiz => {
        if (quiz.attempts) {
          const studentAttempt = quiz.attempts.find(attempt => attempt.student === student.id);
          if (studentAttempt) {
            quizAttempts.push({
              quizId: quiz.id,
              quizTitle: quiz.title,
              score: studentAttempt.score,
              pointsEarned: studentAttempt.pointsEarned,
              completedAt: studentAttempt.completedAt
            });
          }
        }
      });

      return {
        id: student.id,
        name: student.name,
        email: student.email,
        totalPoints: student.points || 0,
        taskSubmissions,
        quizAttempts,
        totalTasks: taskSubmissions.length,
        completedTasks: taskSubmissions.filter(t => t.status === 'approved').length,
        totalQuizzes: quizAttempts.length
      };
    });

  res.json({
    success: true,
    data: studentsPerformance
  });
});

// User creation route
app.post('/api/users', (req, res) => {
  const { name, email, password, role = 'student' } = req.body;

  // Check if user already exists
  const existingUser = mockUsers.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User already exists with this email'
    });
  }

  const newUser = {
    id: (mockUsers.length + 1).toString(),
    name,
    email,
    password: password || 'password123', // Store password for login
    role,
    points: 0,
    badges: [],
    isActive: true,
    createdAt: new Date().toISOString()
  };

  mockUsers.push(newUser);

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: newUser
  });
  mockUsers.push(newUser);

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: newUser
  });
});

// Game Start & Streak Logic
app.post('/api/games/start', (req, res) => {
  const { gameType, userId } = req.body;
  console.log('Game start request:', { gameType, userId });

  if (!userId) {
    return res.status(400).json({ success: false, message: 'User ID is required' });
  }

  const user = mockUsers.find(u => u.id.toString() === userId.toString());
  if (!user) {
    console.log('User not found for game start:', userId);
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const today = new Date().toISOString().split('T')[0];

  if (!user.gameHistory) user.gameHistory = {};

  // Check if already played today - REMOVED per user request
  // if (user.gameHistory[gameType] === today) { ... }

  // Update Streak - REMOVED per user request
  // Simple game start logging

  // Record play (optional, but keeping it simple)
  // user.gameHistory[gameType] = today;

  res.json({
    success: true,
    message: 'Game started',
    data: {
      streak: user.streak || 0,
      canPlay: true
    }
  });
});

// Trivia Game Route
app.post('/api/games/trivia', async (req, res) => {
  // Mock AI generation delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  const mockQuestions = [
    {
      question: "Which of the following is a renewable energy source?",
      options: ["Coal", "Natural Gas", "Solar Power", "Nuclear Energy"],
      correctAnswer: 2,
      explanation: "Solar power is renewable because it is derived from the sun, which is an infinite resource."
    },
    {
      question: "What is the main cause of ocean acidification?",
      options: ["Plastic pollution", "Carbon dioxide absorption", "Oil spills", "Overfishing"],
      correctAnswer: 1,
      explanation: "The ocean absorbs about 30% of the CO2 released in the atmosphere, which increases acidity."
    },
    {
      question: "Which action helps reduce your carbon footprint?",
      options: ["Driving a gas-guzzler", "Eating more meat", "Using public transport", "Leaving lights on"],
      correctAnswer: 2,
      explanation: "Using public transport reduces the number of cars on the road, lowering greenhouse gas emissions."
    },
    {
      question: "What does the 'R' in the 3Rs of waste management stand for?",
      options: ["Run", "Read", "Reduce", "Ride"],
      correctAnswer: 2,
      explanation: "The 3Rs stand for Reduce, Reuse, and Recycle."
    },
    {
      question: "Which of these is a greenhouse gas?",
      options: ["Oxygen", "Nitrogen", "Methane", "Argon"],
      correctAnswer: 2,
      explanation: "Methane is a potent greenhouse gas."
    }
  ];

  // Return 5 random questions
  const shuffled = mockQuestions.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 5);

  res.json({
    success: true,
    data: selected
  });
});

// Video Modules Route
app.get('/api/modules', (req, res) => {
  const mockModules = [
    {
      _id: '1',
      title: 'Introduction to Climate Change',
      category: 'Climate',
      videoUrl: 'https://www.youtube.com/watch?v=G4H1N_yXBiA',
      description: 'Learn the basics of climate change and its impact.'
    },
    {
      _id: '2',
      title: 'The 3Rs: Reduce, Reuse, Recycle',
      category: 'Waste Management',
      videoUrl: 'https://www.youtube.com/watch?v=OasbYWF4_S8',
      description: 'Discover how to manage waste effectively.'
    },
    {
      _id: '3',
      title: 'Renewable Energy Explained',
      category: 'Energy',
      videoUrl: 'https://www.youtube.com/watch?v=1kUE0BZtTRc',
      description: 'Understanding solar, wind, and other renewable sources.'
    }
  ];

  res.json({
    success: true,
    data: mockModules
  });
});

// Daily Challenge Routes
app.get('/api/games/daily-challenge', (req, res) => {
  res.json({
    success: true,
    data: {
      id: 'daily-1',
      title: 'Plastic-Free Day',
      description: 'Avoid using single-use plastics for the entire day.',
      points: 50,
      completed: false // In a real app, check user's status
    }
  });
});

app.post('/api/games/complete-challenge', (req, res) => {
  const { points } = req.body;
  // In a real app, update user points
  res.json({
    success: true,
    data: {
      points: (mockUsers[0].points || 0) + points // Mock update
    }
  });
});

// Daily Tip Route
app.get('/api/games/daily-tip', (req, res) => {
  const tips = [
    "Turn off lights when you leave a room.",
    "Use a reusable water bottle.",
    "Unplug electronics when not in use.",
    "Take shorter showers to save water.",
    "Plant a tree or support local green initiatives."
  ];
  const randomTip = tips[Math.floor(Math.random() * tips.length)];

  res.json({
    success: true,
    data: {
      tip: randomTip
    }
  });
});


// Get Streak Leaderboard
app.get('/api/leaderboard/streaks', (req, res) => {
  const leaderboard = mockUsers
    .filter(u => u.role === 'student')
    .map(u => ({
      id: u.id,
      name: u.name,
      streak: u.streak || 0,
      points: u.points
    }))
    .sort((a, b) => b.streak - a.streak)
    .slice(0, 10); // Top 10

  res.json({
    success: true,
    data: leaderboard
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Nexora Demo Server running on port ${PORT}`);
  console.log(`🌐 API available at: http://localhost:${PORT}`);
  console.log(`📊 Demo mode - using mock data`);
  console.log(`\n🔑 Demo Accounts:`);
  console.log(`Admin: admin@nexora.com / admin123`);
  console.log(`Teacher: teacher1@nexora.com / teacher123`);
  console.log(`Student: student1@nexora.com / student123`);
});

