# 🚀 Nexora Setup Instructions

## Prerequisites

### 1. Install MongoDB
Since MongoDB is not installed on your system, you have two options:

#### Option A: Install MongoDB Locally
1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Install it with default settings
3. Start MongoDB service

#### Option B: Use MongoDB Atlas (Cloud - Recommended)
1. Go to https://www.mongodb.com/atlas
2. Create a free account
3. Create a new cluster
4. Get your connection string
5. Update `backend/config.env` with your Atlas connection string

## Quick Start (After MongoDB is installed)

### 1. Install Dependencies
```bash
npm run install-all
```

### 2. Seed Database
```bash
npm run seed
```

### 3. Start Application
```bash
npm run dev
```

## Alternative: Use MongoDB Atlas (No Local Installation)

1. **Sign up for MongoDB Atlas** (free tier available)
2. **Create a cluster** and get your connection string
3. **Update the environment file**:

Edit `backend/config.env`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nexora?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d
```

4. **Run the application**:
```bash
npm run seed
npm run dev
```

## Demo Accounts

After seeding, use these accounts:
- **Admin**: admin@nexora.com / admin123
- **Teacher**: teacher1@nexora.com / teacher123
- **Student**: student1@nexora.com / student123

## Access URLs
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

