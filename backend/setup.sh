#!/bin/bash

# Kayzera Backend Setup Script

echo "🚀 Setting up Kayzera Backend..."

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
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
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

# Check if MongoDB is running
echo "🔍 Checking MongoDB connection..."
if command -v mongosh &> /dev/null; then
    if mongosh --eval "db.runCommand('ping')" &> /dev/null; then
        echo "✅ MongoDB is running"
    else
        echo "⚠️  MongoDB is not running. Please start MongoDB first:"
        echo "   - Local: mongod"
        echo "   - Or use MongoDB Atlas (cloud)"
    fi
else
    echo "⚠️  MongoDB client not found. Please install MongoDB first."
fi

echo ""
echo "🎯 Next steps:"
echo "1. Update OPENAI_API_KEY in .env file (get from https://platform.openai.com/api-keys)"
echo "2. Start MongoDB if not running"
echo "3. Run: npm run dev"
echo "4. Seed database: node seed.js"
echo ""
echo "📚 Demo accounts will be created:"
echo "   - Investor: investor@demo.com / password123"
echo "   - Developer: developer@demo.com / password123"
echo "   - Admin: admin@demo.com / password123"
echo "   - Buyer: buyer@demo.com / password123"
