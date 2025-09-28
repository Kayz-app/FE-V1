# PostgreSQL Migration Guide

## Migration Complete ✅

Your backend has been successfully migrated from MongoDB to PostgreSQL! Here's what was changed:

### Changes Made:

1. **Database Configuration** (`backend/config/database.js`)
   - Created Sequelize configuration for PostgreSQL
   - Added connection testing functionality

2. **Models Converted to Sequelize:**
   - `User.js` - User authentication and profile data
   - `Project.js` - Real estate project information  
   - `Portfolio.js` - User investment portfolios
   - `MarketListing.js` - Secondary market listings
   - `KycDocument.js` - KYC document management

3. **Server Updated** (`backend/server.js`)
   - Removed MongoDB/Mongoose dependencies
   - Added PostgreSQL connection and table synchronization
   - Proper error handling for database connections

4. **All Routes Updated:**
   - `auth.js` - Authentication routes
   - `users.js` - User management routes
   - `projects.js` - Project management routes
   - `kyc.js` - KYC document routes
   - `admin.js` - Admin dashboard routes
   - `wallet.js` - Wallet management routes

5. **Middleware Updated:**
   - `auth.js` - Updated to use Sequelize queries

6. **Model Associations** (`backend/models/index.js`)
   - Defined relationships between all models
   - Proper foreign key constraints

## Setup Instructions:

### 1. Install PostgreSQL
```bash
# Windows (using Chocolatey)
choco install postgresql

# Or download from https://www.postgresql.org/download/windows/
```

### 2. Create Database
```sql
-- Connect to PostgreSQL as superuser
CREATE DATABASE kayzera;
CREATE USER postgres WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE kayzera TO postgres;
```

### 3. Create .env File
Create `backend/.env` with:
```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database - PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=kayzera
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# OpenAI API Key
OPENAI_API_KEY=your-openai-api-key-here

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

### 4. Start PostgreSQL Service
```bash
# Windows
net start postgresql-x64-14

# Or start from Services.msc
```

### 5. Test the Migration
```bash
cd backend
npm start
```

You should see:
```
Connected to PostgreSQL database
Database tables synchronized
Server running on port 3001
```

## Key Differences from MongoDB:

### Model Queries:
- `User.findById(id)` → `User.findByPk(id)`
- `User.findOne({email})` → `User.findOne({where: {email}})`
- `User.create(data)` → `User.create(data)` (same)
- `user.save()` → `user.update(data)`

### Field Access:
- `user._id` → `user.id`
- `user.wallet.ngn` → `user.walletNgn`
- `user.companyProfile.name` → `user.companyName`

### Associations:
- `populate('developerId')` → `include: [{model: User, as: 'developer'}]`

## Testing the API:

### 1. Health Check
```bash
curl http://localhost:3001/api/health
```

### 2. Register User
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "userType": "investor"
  }'
```

### 3. Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## Troubleshooting:

### Connection Issues:
- Ensure PostgreSQL is running
- Check database credentials in .env
- Verify database exists

### Table Creation Issues:
- Check PostgreSQL user permissions
- Ensure database is empty or use `force: true` in sync options

### Query Issues:
- Check model associations are properly defined
- Verify field names match database schema

## Next Steps:

1. **Test all API endpoints** to ensure functionality
2. **Update frontend** if needed for any response format changes
3. **Remove MongoDB dependencies** from package.json (optional)
4. **Set up database backups** for production
5. **Configure connection pooling** for production use

The migration is complete and your backend is now using PostgreSQL! 🎉
