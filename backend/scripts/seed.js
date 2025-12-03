const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './config.env' });

const User = require('../models/User');
const Task = require('../models/Task');
const Quiz = require('../models/Quiz');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected for seeding');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Clear existing data
const clearData = async () => {
  try {
    await User.deleteMany({});
    await Task.deleteMany({});
    await Quiz.deleteMany({});
    console.log('Cleared existing data');
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};

// Create users
const createUsers = async () => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('student123', salt); // Using same password for simplicity or hash individually

    const users = [
      {
        name: 'Admin User',
        email: 'admin@nexora.com',
        password: await bcrypt.hash('admin123', salt),
        role: 'admin',
        points: 0,
        isApproved: true
      },
      {
        name: 'Teacher One',
        email: 'teacher1@nexora.com',
        password: await bcrypt.hash('teacher123', salt),
        role: 'teacher',
        points: 0,
        isApproved: true
      },
      {
        name: 'Teacher Two',
        email: 'teacher2@nexora.com',
        password: await bcrypt.hash('teacher123', salt),
        role: 'teacher',
        points: 0,
        isApproved: true
      },
      {
        name: 'Student One',
        email: 'student1@nexora.com',
        password: await bcrypt.hash('student123', salt),
        role: 'student',
        points: 150,
        isApproved: true,
        badges: [
          {
            name: 'Eco Warrior',
            description: 'Completed 5 environmental tasks'
          },
          {
            name: 'Quiz Master',
            description: 'Scored 90% or higher on 3 quizzes'
          }
        ]
      },
      {
        name: 'Student Two',
        email: 'student2@nexora.com',
        password: await bcrypt.hash('student123', salt),
        role: 'student',
        points: 85,
        isApproved: true,
        badges: [
          {
            name: 'Eco Warrior',
            description: 'Completed 5 environmental tasks'
          }
        ]
      },
      {
        name: 'Student Three',
        email: 'student3@nexora.com',
        password: await bcrypt.hash('student123', salt),
        role: 'student',
        points: 200,
        isApproved: true,
        badges: [
          {
            name: 'Eco Warrior',
            description: 'Completed 5 environmental tasks'
          },
          {
            name: 'Quiz Master',
            description: 'Scored 90% or higher on 3 quizzes'
          },
          {
            name: 'Climate Champion',
            description: 'Completed 10 climate-related tasks'
          }
        ]
      }
    ];

    const createdUsers = await User.insertMany(users);
    console.log(`Created ${createdUsers.length} users`);
    return createdUsers;
  } catch (error) {
    console.error('Error creating users:', error);
  }
};

// Create tasks
const createTasks = async (users) => {
  try {
    const admin = users.find(u => u.role === 'admin');
    const teacher1 = users.find(u => u.email === 'teacher1@nexora.com');
    const students = users.filter(u => u.role === 'student');

    const tasks = [
      {
        title: 'Recycle Plastic Bottles',
        description: 'Collect and properly recycle 10 plastic bottles. Take a photo of the bottles before recycling and document the recycling process.',
        category: 'recycling',
        points: 20,
        difficulty: 'easy',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        createdBy: teacher1._id,
        assignedTo: students.map(s => s._id),
        submissions: [
          {
            student: students[0]._id,
            description: 'Collected 12 plastic bottles from my neighborhood and took them to the local recycling center. The process was smooth and I learned about the different types of plastic.',
            files: [
              {
                filename: 'bottles-before.jpg',
                originalName: 'bottles-before.jpg',
                path: '/uploads/bottles-before.jpg'
              }
            ],
            status: 'approved',
            reviewedBy: teacher1._id,
            reviewedAt: new Date(),
            feedback: 'Great work! You exceeded the requirement and provided good documentation.',
            pointsAwarded: 20,
            submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
          }
        ]
      },
      {
        title: 'Energy Conservation Challenge',
        description: 'Reduce your household energy consumption by 20% for one week. Track your daily usage and implement energy-saving measures.',
        category: 'energy',
        points: 50,
        difficulty: 'medium',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        createdBy: admin._id,
        assignedTo: students.map(s => s._id),
        submissions: [
          {
            student: students[2]._id,
            description: 'Implemented several energy-saving measures: switched to LED bulbs, unplugged unused electronics, and reduced AC usage. Achieved 25% reduction in energy consumption.',
            files: [
              {
                filename: 'energy-bill-comparison.pdf',
                originalName: 'energy-bill-comparison.pdf',
                path: '/uploads/energy-bill-comparison.pdf'
              }
            ],
            status: 'approved',
            reviewedBy: admin._id,
            reviewedAt: new Date(),
            feedback: 'Excellent work! You exceeded the target and provided detailed documentation.',
            pointsAwarded: 50,
            submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
          }
        ]
      },
      {
        title: 'Water Conservation Project',
        description: 'Create a water conservation plan for your home and implement it for one week. Document your water usage and conservation methods.',
        category: 'water',
        points: 30,
        difficulty: 'easy',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        createdBy: teacher1._id,
        assignedTo: students.map(s => s._id)
      },
      {
        title: 'Biodiversity Survey',
        description: 'Conduct a biodiversity survey in your local park or garden. Identify and document at least 10 different plant and animal species.',
        category: 'biodiversity',
        points: 40,
        difficulty: 'hard',
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
        createdBy: admin._id,
        assignedTo: students.map(s => s._id)
      }
    ];

    const createdTasks = await Task.insertMany(tasks);
    console.log(`Created ${createdTasks.length} tasks`);
    return createdTasks;
  } catch (error) {
    console.error('Error creating tasks:', error);
  }
};

// Create quizzes
const createQuizzes = async (users) => {
  try {
    const teacher1 = users.find(u => u.email === 'teacher1@nexora.com');
    const students = users.filter(u => u.role === 'student');

    const quizzes = [
      {
        title: 'Climate Change Basics',
        description: 'Test your knowledge about climate change and its impacts on our planet.',
        category: 'climate',
        points: 25,
        timeLimit: 15,
        createdBy: teacher1._id,
        questions: [
          {
            question: 'What is the primary cause of global warming?',
            options: [
              'Solar radiation',
              'Greenhouse gases',
              'Ocean currents',
              'Volcanic activity'
            ],
            correctAnswer: 1,
            explanation: 'Greenhouse gases trap heat in the atmosphere, causing global warming.'
          },
          {
            question: 'Which gas is the most significant contributor to the greenhouse effect?',
            options: [
              'Oxygen',
              'Nitrogen',
              'Carbon dioxide',
              'Argon'
            ],
            correctAnswer: 2,
            explanation: 'Carbon dioxide is the most significant greenhouse gas contributing to climate change.'
          },
          {
            question: 'What is the main source of carbon dioxide emissions?',
            options: [
              'Deforestation',
              'Burning fossil fuels',
              'Agriculture',
              'Industrial processes'
            ],
            correctAnswer: 1,
            explanation: 'Burning fossil fuels for energy is the primary source of carbon dioxide emissions.'
          }
        ],
        attempts: [
          {
            student: students[0]._id,
            answers: [1, 2, 1],
            score: 100,
            pointsAwarded: 25,
            completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
          },
          {
            student: students[1]._id,
            answers: [1, 2, 0],
            score: 66.67,
            pointsAwarded: 16,
            completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
          }
        ]
      },
      {
        title: 'Recycling Knowledge',
        description: 'How well do you know about recycling and waste management?',
        category: 'recycling',
        points: 20,
        timeLimit: 10,
        createdBy: teacher1._id,
        questions: [
          {
            question: 'Which of the following can be recycled?',
            options: [
              'Plastic bottles',
              'Pizza boxes with grease',
              'Broken glass',
              'All of the above'
            ],
            correctAnswer: 0,
            explanation: 'Only clean plastic bottles can be recycled. Greasy pizza boxes and broken glass cannot be recycled.'
          },
          {
            question: 'What is the recycling symbol number for PET plastic?',
            options: [
              '1',
              '2',
              '3',
              '4'
            ],
            correctAnswer: 0,
            explanation: 'PET (Polyethylene Terephthalate) is marked with recycling symbol number 1.'
          }
        ]
      }
    ];

    const createdQuizzes = await Quiz.insertMany(quizzes);
    console.log(`Created ${createdQuizzes.length} quizzes`);
    return createdQuizzes;
  } catch (error) {
    console.error('Error creating quizzes:', error);
  }
};

// Main seed function
const seed = async () => {
  try {
    await connectDB();
    await clearData();

    const users = await createUsers();
    const tasks = await createTasks(users);
    const quizzes = await createQuizzes(users);

    console.log('\n=== SEEDING COMPLETED ===');
    console.log('Users created:', users.length);
    console.log('Tasks created:', tasks.length);
    console.log('Quizzes created:', quizzes.length);
    console.log('\nDefault accounts:');
    console.log('Admin: admin@nexora.com / admin123');
    console.log('Teacher: teacher1@nexora.com / teacher123');
    console.log('Student: student1@nexora.com / student123');
    console.log('Student: student2@nexora.com / student123');
    console.log('Student: student3@nexora.com / student123');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seed();
