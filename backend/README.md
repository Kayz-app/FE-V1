# Kayzera Backend API

Backend API for the Kayzera Real Estate Tokenization Platform.

## 🚀 Quick Start

### Prerequisites
- Node.js v20.11.1+
- MongoDB (local or cloud)
- OpenAI API key (for AI features)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` and add your values:
   ```env
   PORT=3001
   MONGODB_URI=mongodb://localhost:27017/kayzera
   JWT_SECRET=your-super-secret-jwt-key
   OPENAI_API_KEY=your-openai-api-key
   FRONTEND_URL=http://localhost:5173
   ```

3. **Start MongoDB:**
   ```bash
   # If using local MongoDB
   mongod
   
   # Or use MongoDB Atlas (cloud)
   # Update MONGODB_URI in .env
   ```

4. **Seed the database:**
   ```bash
   node seed.js
   ```

5. **Start the server:**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users` - Get all users (admin)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user (admin)
- `DELETE /api/users/:id` - Deactivate user (admin)

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create project (developer)
- `PUT /api/projects/:id` - Update project
- `PUT /api/projects/:id/status` - Update project status (admin)
- `GET /api/projects/portfolio/:userId` - Get user portfolio
- `POST /api/projects/portfolio` - Add token to portfolio

### KYC
- `POST /api/kyc/upload` - Upload KYC document
- `GET /api/kyc/documents` - Get user's KYC documents
- `GET /api/kyc/status` - Get KYC status
- `GET /api/kyc/pending` - Get pending KYC (admin)
- `PUT /api/kyc/:id/approve` - Approve KYC document (admin)
- `PUT /api/kyc/:id/reject` - Reject KYC document (admin)

### AI
- `POST /api/ai/chat` - AI chat endpoint
- `POST /api/ai/generate-description` - Generate project description
- `GET /api/ai/health` - AI service health check

### Admin
- `GET /api/admin/dashboard` - Admin dashboard overview
- `GET /api/admin/users` - Get users with pagination
- `GET /api/admin/projects/pending` - Get pending projects
- `PUT /api/admin/projects/:id/approve` - Approve project
- `PUT /api/admin/projects/:id/reject` - Reject project
- `GET /api/admin/compliance` - Get KYC compliance data
- `PUT /api/admin/users/:id/kyc` - Update user KYC status
- `GET /api/admin/analytics` - Get platform analytics

### Wallet
- `GET /api/wallet/balance` - Get wallet balance
- `PUT /api/wallet/balance` - Update wallet balance
- `GET /api/wallet/exchange-rates` - Get exchange rates
- `POST /api/wallet/deposit` - Simulate deposit
- `POST /api/wallet/withdraw` - Simulate withdrawal

### Health Check
- `GET /api/health` - Server health check

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## 📁 File Uploads

KYC documents are uploaded to the `uploads/` directory and served at `/uploads/` endpoint.

## 🧪 Testing

### Demo Accounts
After seeding the database, you can use these accounts:

- **Investor**: `investor@demo.com` / `password123`
- **Developer**: `developer@demo.com` / `password123`
- **Admin**: `admin@demo.com` / `password123`
- **Buyer**: `buyer@demo.com` / `password123`

### Test with curl

```bash
# Register a new user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User","userType":"investor"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"investor@demo.com","password":"password123"}'

# Get projects (no auth required)
curl http://localhost:3001/api/projects

# Get current user (requires auth)
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer <your_jwt_token>"
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/kayzera` |
| `JWT_SECRET` | JWT signing secret | Required |
| `OPENAI_API_KEY` | OpenAI API key | Required for AI features |
| `MAX_FILE_SIZE` | Max upload file size | `10485760` (10MB) |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |

## 🚨 Production Considerations

1. **Security**:
   - Use strong JWT secrets
   - Enable HTTPS
   - Implement rate limiting
   - Validate all inputs

2. **Database**:
   - Use MongoDB Atlas or managed database
   - Enable authentication
   - Set up backups

3. **File Storage**:
   - Use cloud storage (AWS S3, etc.)
   - Implement file validation
   - Set up CDN

4. **Monitoring**:
   - Add logging
   - Set up error tracking
   - Monitor performance

## 📝 API Documentation

For detailed API documentation, start the server and visit:
- Health check: `http://localhost:3001/api/health`
- API endpoints: See routes in `/routes` directory

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

ISC License
