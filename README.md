# 🌱 Nexora - Gamified Environmental Education Platform

A full-stack web application that gamifies environmental education through tasks, quizzes, and a point-based reward system.

## 🚀 Features

### Student Features
- **Dashboard**: View personal stats, points, and badges
- **Task Management**: Submit environmental tasks with file uploads
- **Quiz System**: Take environmental quizzes and earn points
- **Leaderboard**: Compete with other students
- **Badge System**: Earn badges for achievements

### Teacher Features
- **Task Creation**: Create and assign environmental tasks
- **Submission Review**: Review and approve student submissions
- **Student Management**: View and manage student progress
- **Quiz Creation**: Create educational quizzes

### Admin Features
- **User Management**: Manage all users and assign roles
- **Platform Oversight**: Monitor overall platform activity
- **Content Management**: Manage tasks and quizzes

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite + React Router + Axios
- **Backend**: Node.js + Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **File Uploads**: Multer

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## 🚀 Quick Start

### 1. Clone and Install Dependencies

```bash
# Install root dependencies
npm install

# Install all project dependencies (backend + frontend)
npm run install-all
```

### 2. Set up Environment Variables

The backend uses `backend/config.env` for environment variables. The default configuration should work for local development:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nexora
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d
```

### 3. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# For local MongoDB installation
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in backend/config.env
```

### 4. Seed the Database

```bash
npm run seed
```

This will create sample users, tasks, and quizzes.

### 5. Start the Application

```bash
npm run dev
```

This will start both the backend (port 5000) and frontend (port 5173) servers.

## 🔑 Demo Accounts

After seeding, you can use these accounts to test the platform:

### Admin Account
- **Email**: admin@nexora.com
- **Password**: admin123
- **Access**: Full platform management

### Teacher Account
- **Email**: teacher1@nexora.com
- **Password**: teacher123
- **Access**: Create tasks, review submissions, manage students

### Student Accounts
- **Email**: student1@nexora.com
- **Password**: student123
- **Points**: 150 (with badges)
- **Email**: student2@nexora.com
- **Password**: student123
- **Points**: 85 (with badges)
- **Email**: student3@nexora.com
- **Password**: student123
- **Points**: 200 (with badges)

## 📁 Project Structure

```
nexora/
├── backend/
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Auth & upload middleware
│   ├── scripts/          # Database seeding
│   ├── uploads/          # File uploads (created automatically)
│   └── server.js         # Express server
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── contexts/     # React contexts
│   │   └── App.jsx       # Main app component
│   └── public/           # Static assets
├── package.json          # Root package.json
└── README.md
```

## 🔧 Available Scripts

### Root Level
- `npm run install-all` - Install all dependencies
- `npm run seed` - Seed the database
- `npm run dev` - Start both servers
- `npm run build` - Build frontend for production
- `npm start` - Start production server

### Backend Only
- `cd backend && npm run dev` - Start backend in development mode
- `cd backend && npm start` - Start backend in production mode
- `cd backend && npm run seed` - Run database seeding

### Frontend Only
- `cd frontend && npm run dev` - Start frontend development server
- `cd frontend && npm run build` - Build for production
- `cd frontend && npm run preview` - Preview production build

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/students` - Get all students
- `GET /api/users/leaderboard` - Get leaderboard
- `PUT /api/users/:id/role` - Update user role (admin only)
- `PUT /api/users/:id/deactivate` - Deactivate user (admin only)

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/my-tasks` - Get user's tasks
- `POST /api/tasks` - Create task (teacher/admin)
- `POST /api/tasks/:id/submit` - Submit task (student)
- `PUT /api/tasks/:id/review` - Review submission (teacher/admin)

### Quizzes
- `GET /api/quizzes` - Get all quizzes
- `POST /api/quizzes` - Create quiz (teacher/admin)
- `POST /api/quizzes/:id/attempt` - Submit quiz attempt (student)
- `GET /api/quizzes/:id/results` - Get quiz results (teacher/admin)

## 🎮 Gamification Features

### Points System
- Students earn points for completing tasks and quizzes
- Points are awarded based on task difficulty and quiz performance
- Points are displayed on the dashboard and leaderboard

### Badge System
- **Eco Warrior**: Complete 5 environmental tasks
- **Quiz Master**: Score 90% or higher on 3 quizzes
- **Climate Champion**: Complete 10 climate-related tasks

### Leaderboard
- Real-time ranking of students by points
- Top 10 students displayed on dashboard
- Encourages healthy competition

## 🔒 Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Input validation and sanitization
- File upload restrictions

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB Atlas or use a cloud MongoDB service
2. Update environment variables for production
3. Deploy to platforms like Heroku, Railway, or DigitalOcean

### Frontend Deployment
1. Build the frontend: `npm run build`
2. Deploy to platforms like Vercel, Netlify, or GitHub Pages
3. Update API endpoints to point to production backend

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:

1. Check that MongoDB is running
2. Verify all dependencies are installed
3. Check the console for error messages
4. Ensure ports 5000 and 5173 are available

## 🌟 Future Enhancements

- Real-time notifications
- Mobile app development
- Advanced analytics dashboard
- Social features (comments, sharing)
- Integration with external environmental APIs
- Advanced gamification (levels, achievements)
- Multi-language support

---

**Happy Learning! 🌱♻️**

