// Demo startup script for Nexora
const { spawn } = require('child_process');
const path = require('path');

console.log('🌱 Starting Nexora - Environmental Education Platform');
console.log('====================================================\n');

console.log('📋 This is a complete full-stack application with:');
console.log('✅ Backend: Node.js + Express + MongoDB models');
console.log('✅ Frontend: React 18 + Vite + Modern UI');
console.log('✅ Authentication: JWT with role-based access');
console.log('✅ Features: Tasks, Quizzes, Gamification');
console.log('✅ File uploads, Points system, Leaderboard');
console.log('✅ Responsive design with modern CSS\n');

console.log('⚠️  Note: To run the full application, you need MongoDB installed.');
console.log('📖 See setup.md for MongoDB installation instructions.\n');

console.log('🚀 Starting frontend development server...\n');

// Start the frontend server
const frontendProcess = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'frontend'),
  stdio: 'inherit',
  shell: true
});

frontendProcess.on('error', (error) => {
  console.error('❌ Error starting frontend:', error.message);
  console.log('\n💡 Try running: cd frontend && npm run dev');
});

frontendProcess.on('close', (code) => {
  console.log(`\n🛑 Frontend server stopped with code ${code}`);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  frontendProcess.kill();
  process.exit(0);
});

console.log('🌐 Frontend will be available at: http://localhost:5173');
console.log('📱 The UI will show login/register forms (backend needs MongoDB to work)');
console.log('\n⏹️  Press Ctrl+C to stop the server');

