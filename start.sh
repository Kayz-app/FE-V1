#!/bin/bash

# Kayzera Platform Quick Start Script

echo "🚀 Starting Kayzera Real Estate Platform..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js v20.11.1+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2)
REQUIRED_VERSION="20.11.1"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    print_warning "Node.js version $NODE_VERSION detected. Recommended: v20.11.1+"
fi

print_status "Node.js version: $NODE_VERSION"

# Check if MongoDB is running
if command -v mongosh &> /dev/null; then
    if mongosh --eval "db.runCommand('ping')" &> /dev/null; then
        print_status "MongoDB is running"
    else
        print_warning "MongoDB is not running. Please start MongoDB first:"
        echo "   - Local: mongod"
        echo "   - Or use MongoDB Atlas (cloud)"
        echo ""
        read -p "Do you want to continue anyway? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
else
    print_warning "MongoDB client not found. Please install MongoDB first."
fi

# Setup Backend
print_info "Setting up backend..."
cd backend

# Install backend dependencies
if [ ! -d "node_modules" ]; then
    print_info "Installing backend dependencies..."
    npm install
    if [ $? -eq 0 ]; then
        print_status "Backend dependencies installed"
    else
        print_error "Failed to install backend dependencies"
        exit 1
    fi
else
    print_status "Backend dependencies already installed"
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    print_info "Creating .env file..."
    cat > .env << EOF
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/kayzera
JWT_SECRET=kayzera-super-secret-jwt-key-change-in-production
OPENAI_API_KEY=your-openai-api-key-here
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
FRONTEND_URL=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF
    print_status ".env file created"
    print_warning "Please update OPENAI_API_KEY in backend/.env file"
else
    print_status ".env file already exists"
fi

# Seed database
print_info "Seeding database..."
node seed.js
if [ $? -eq 0 ]; then
    print_status "Database seeded successfully"
else
    print_warning "Database seeding failed (MongoDB might not be running)"
fi

# Start backend server
print_info "Starting backend server..."
npm run dev &
BACKEND_PID=$!
print_status "Backend server started (PID: $BACKEND_PID)"

# Wait for backend to start
sleep 3

# Test backend health
print_info "Testing backend health..."
if curl -s http://localhost:3001/api/health > /dev/null; then
    print_status "Backend is healthy"
else
    print_warning "Backend health check failed"
fi

# Setup Frontend
cd ..
print_info "Setting up frontend..."

# Install frontend dependencies
if [ ! -d "node_modules" ]; then
    print_info "Installing frontend dependencies..."
    npm install
    if [ $? -eq 0 ]; then
        print_status "Frontend dependencies installed"
    else
        print_error "Failed to install frontend dependencies"
        kill $BACKEND_PID
        exit 1
    fi
else
    print_status "Frontend dependencies already installed"
fi

# Start frontend server
print_info "Starting frontend server..."
npm run dev &
FRONTEND_PID=$!
print_status "Frontend server started (PID: $FRONTEND_PID)"

# Wait for frontend to start
sleep 5

# Test frontend
print_info "Testing frontend..."
if curl -s http://localhost:5173 > /dev/null; then
    print_status "Frontend is running"
else
    print_warning "Frontend might not be ready yet"
fi

echo ""
echo "🎉 Kayzera Platform is starting up!"
echo ""
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend API: http://localhost:3001/api"
echo "❤️  Health Check: http://localhost:3001/api/health"
echo ""
echo "👤 Demo Accounts:"
echo "   Investor: investor@demo.com / password123"
echo "   Developer: developer@demo.com / password123"
echo "   Admin: admin@demo.com / password123"
echo "   Buyer: buyer@demo.com / password123"
echo ""
echo "🔗 Smart Contract Integration:"
echo "   - Connect MetaMask wallet"
echo "   - Switch to Sepolia testnet"
echo "   - Get Sepolia ETH from faucet"
echo ""
echo "⚠️  Important Notes:"
echo "   - Update OPENAI_API_KEY in backend/.env for AI features"
echo "   - Ensure MongoDB is running for full functionality"
echo "   - MetaMask required for blockchain features"
echo ""
echo "🛑 To stop the servers:"
echo "   Press Ctrl+C or run: kill $BACKEND_PID $FRONTEND_PID"
echo ""

# Keep script running
wait
