@echo off
REM Kayzera Platform Quick Start Script for Windows

echo 🚀 Starting Kayzera Real Estate Platform...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js v20.11.1+ first.
    pause
    exit /b 1
)

echo ✅ Node.js is installed
node --version

REM Check if MongoDB is running
mongosh --eval "db.runCommand('ping')" >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  MongoDB is not running. Please start MongoDB first:
    echo    - Local: mongod
    echo    - Or use MongoDB Atlas (cloud)
    echo.
    set /p continue="Do you want to continue anyway? (y/n): "
    if /i not "%continue%"=="y" exit /b 1
) else (
    echo ✅ MongoDB is running
)

REM Setup Backend
echo ℹ️  Setting up backend...
cd backend

REM Install backend dependencies
if not exist "node_modules" (
    echo ℹ️  Installing backend dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install backend dependencies
        pause
        exit /b 1
    )
    echo ✅ Backend dependencies installed
) else (
    echo ✅ Backend dependencies already installed
)

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo ℹ️  Creating .env file...
    (
        echo PORT=3001
        echo NODE_ENV=development
        echo MONGODB_URI=mongodb://localhost:27017/kayzera
        echo JWT_SECRET=kayzera-super-secret-jwt-key-change-in-production
        echo OPENAI_API_KEY=your-openai-api-key-here
        echo MAX_FILE_SIZE=10485760
        echo UPLOAD_PATH=./uploads
        echo FRONTEND_URL=http://localhost:5173
        echo RATE_LIMIT_WINDOW_MS=900000
        echo RATE_LIMIT_MAX_REQUESTS=100
    ) > .env
    echo ✅ .env file created
    echo ⚠️  Please update OPENAI_API_KEY in backend/.env file
) else (
    echo ✅ .env file already exists
)

REM Seed database
echo ℹ️  Seeding database...
node seed.js
if %errorlevel% equ 0 (
    echo ✅ Database seeded successfully
) else (
    echo ⚠️  Database seeding failed (MongoDB might not be running)
)

REM Start backend server
echo ℹ️  Starting backend server...
start "Backend Server" cmd /k "npm run dev"

REM Wait for backend to start
timeout /t 3 /nobreak >nul

REM Test backend health
echo ℹ️  Testing backend health...
curl -s http://localhost:3001/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend is healthy
) else (
    echo ⚠️  Backend health check failed
)

REM Setup Frontend
cd ..
echo ℹ️  Setting up frontend...

REM Install frontend dependencies
if not exist "node_modules" (
    echo ℹ️  Installing frontend dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install frontend dependencies
        pause
        exit /b 1
    )
    echo ✅ Frontend dependencies installed
) else (
    echo ✅ Frontend dependencies already installed
)

REM Start frontend server
echo ℹ️  Starting frontend server...
start "Frontend Server" cmd /k "npm run dev"

REM Wait for frontend to start
timeout /t 5 /nobreak >nul

REM Test frontend
echo ℹ️  Testing frontend...
curl -s http://localhost:5173 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend is running
) else (
    echo ⚠️  Frontend might not be ready yet
)

echo.
echo 🎉 Kayzera Platform is starting up!
echo.
echo 📱 Frontend: http://localhost:5173
echo 🔧 Backend API: http://localhost:3001/api
echo ❤️  Health Check: http://localhost:3001/api/health
echo.
echo 👤 Demo Accounts:
echo    Investor: investor@demo.com / password123
echo    Developer: developer@demo.com / password123
echo    Admin: admin@demo.com / password123
echo    Buyer: buyer@demo.com / password123
echo.
echo 🔗 Smart Contract Integration:
echo    - Connect MetaMask wallet
echo    - Switch to Sepolia testnet
echo    - Get Sepolia ETH from faucet
echo.
echo ⚠️  Important Notes:
echo    - Update OPENAI_API_KEY in backend/.env for AI features
echo    - Ensure MongoDB is running for full functionality
echo    - MetaMask required for blockchain features
echo.
echo 🛑 To stop the servers, close the command windows
echo.
pause
