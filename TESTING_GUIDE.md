# 🧪 Complete Testing Guide for Kayzera Platform

## 🚀 Backend Setup & Testing

### 1. Start the Backend Server

```bash
# Navigate to backend directory
cd backend

# Install dependencies (if not done)
npm install

# Create .env file
cp env.example .env
# Edit .env and add your OpenAI API key

# Start MongoDB (if using local)
mongod

# Seed the database
node seed.js

# Start the backend server
npm run dev
```

**Expected Output:**

```
Connected to MongoDB
Server running on port 3001
Health check: http://localhost:3001/api/health
```

### 2. Test Backend API Endpoints

#### Health Check

```bash
curl http://localhost:3001/api/health
```

#### Register New User

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

#### Login with Demo Account

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "investor@demo.com",
    "password": "password123"
  }'
```

#### Get Projects (No Auth Required)

```bash
curl http://localhost:3001/api/projects
```

#### Get Current User (Requires Auth)

```bash
# Use the token from login response
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## 🎨 Frontend Setup & Testing

### 1. Start the Frontend Server

```bash
# Navigate to frontend directory (from project root)
cd ..

# Start the frontend server
npm run dev
```

**Expected Output:**

```
VITE v5.4.10  ready in 798 ms
➜  Local:   http://localhost:5173/
```

### 2. Test Frontend Features

#### Basic Navigation

1. **Landing Page**: Visit `http://localhost:5173`

   - ✅ Should load without errors
   - ✅ Should display projects
   - ✅ Should have navigation menu
2. **Authentication Pages**:

   - Click "Sign In" → Should show login form
   - Click "Register" → Should show registration form
   - Click "Forgot Password" → Should show password reset form

#### Demo Account Testing

**Login with Demo Accounts:**

- **Investor**: `investor@demo.com` / `password123`
- **Developer**: `developer@demo.com` / `password123`
- **Admin**: `admin@demo.com` / `password123`
- **Buyer**: `buyer@demo.com` / `password123`

#### Investor Dashboard Testing

1. **Login as Investor** (`investor@demo.com`)
2. **Test Features**:

   - Dashboard overview loads
   - My Tokens section shows portfolio
   - Marketplace shows available projects
   - Wallet shows balances
   -  Settings shows KYC status
3. **Investment Flow**:

   - Go to Marketplace
   - Click on a project
   - Click "Invest Now"
   - Connect MetaMask wallet
   - Enter investment amount
   - Submit transaction
4. **KYC Testing**:

   - Go to Settings
   - Click KYC section
   - Upload test documents
   - Check status updates

#### Developer Dashboard Testing

1. **Login as Developer** (`developer@demo.com`)
2. **Test Features**:

   - Dashboard overview loads
   - My Projects shows created projects
   - Create Project form works
   - Wallet shows balances
3. **Project Creation**:

   - Click "Create Project"
   - Fill out project form
   - Connect MetaMask wallet
   - Submit for review
   - Check project appears in "My Projects"

#### Admin Dashboard Testing

1. **Login as Admin** (`admin@demo.com`)
2. **Test Features**:

   - Dashboard overview loads
   - User Management shows all users
   - Project Approvals shows pending projects
   -  Compliance shows KYC statuses
3. **Admin Actions**:

   - Approve/reject projects
   - Update user KYC status
   - View analytics

## 🔗 Integration Testing

### 1. Backend-Frontend Integration

#### Test API Connection

1. Open browser dev tools (F12)
2. Go to Network tab
3. Login to frontend
4. Check for API calls to `localhost:3001`

#### Test Data Persistence

1. Create a project as developer
2. Refresh the page
3. Check if project persists
4. Login as admin and approve project
5. Check if status updates

### 2. Smart Contract Integration

#### Test Wallet Connection

1. Click "Connect Wallet" in header
2. MetaMask should open
3. Connect to Sepolia testnet
4. Address should appear in header

#### Test Investment Transaction

1. Go to project details
2. Click "Invest Now"
3. Enter amount
4. MetaMask should show transaction
5. Confirm transaction
6. Check for success message

#### Test Project Creation

1. Login as developer
2. Create new project
3. MetaMask should show contract deployment
4. Confirm transaction
5. Check for contract address

## 🐛 Common Issues & Solutions

### Backend Issues

**MongoDB Connection Error:**

```bash
# Check if MongoDB is running
mongosh --eval "db.runCommand('ping')"

# Start MongoDB if not running
mongod
```

**Port Already in Use:**

```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or change port in .env
PORT=3002
```

**OpenAI API Error:**

- Check if API key is set in `.env`
- Verify API key is valid
- Check OpenAI account has credits

### Frontend Issues

**CORS Error:**

- Ensure backend is running on port 3001
- Check `FRONTEND_URL` in backend `.env`
- Verify CORS settings in `server.js`

**Import Errors:**

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Vite Build Errors:**

```bash
# Clear Vite cache
rm -rf .vite
npm run dev
```

### Smart Contract Issues

**MetaMask Not Detected:**

- Ensure MetaMask is installed
- Check if MetaMask is unlocked
- Try refreshing the page

**Wrong Network:**

- Switch to Sepolia testnet in MetaMask
- Add Sepolia network if not available
- Get Sepolia ETH from faucet

**Transaction Fails:**

- Check if you have enough Sepolia ETH for gas
- Verify contract addresses are correct
- Check browser console for errors

## 📊 Performance Testing

### 1. Load Testing

**Test Multiple Users:**

```bash
# Use Apache Bench to test API
ab -n 100 -c 10 http://localhost:3001/api/health
```

**Test Database Performance:**

- Create multiple projects
- Upload multiple KYC documents
- Test pagination with large datasets

### 2. Frontend Performance

**Check Bundle Size:**

```bash
npm run build
# Check dist folder size
```

**Test Loading Times:**

- Use browser dev tools Performance tab
- Check for slow API calls
- Monitor memory usage

## 🔒 Security Testing

### 1. Authentication Testing

**Test JWT Security:**

- Try accessing protected routes without token
- Test with expired token
- Test with invalid token

**Test Input Validation:**

- Try SQL injection in forms
- Test XSS in text inputs
- Test file upload security

### 2. Authorization Testing

**Test Role-Based Access:**

- Try accessing admin routes as investor
- Test developer-only features as investor
- Verify KYC requirements

## 📱 Mobile Testing

### 1. Responsive Design

**Test on Different Screen Sizes:**

- Mobile (375px)
- Tablet (768px)
- Desktop (1024px+)

**Test Touch Interactions:**

- Tap targets are large enough
- Forms work on mobile
- Wallet connection works on mobile

## 🚀 Production Deployment Testing

### 1. Environment Testing

**Test Production Build:**

```bash
npm run build
npm run preview
```

**Test Environment Variables:**

- Verify all required env vars are set
- Test with production database
- Verify file uploads work

### 2. Database Migration

**Test Data Migration:**

- Export data from development
- Import to production database
- Verify data integrity

## 📋 Testing Checklist

### ✅ Backend Testing

- [ ] Server starts without errors
- [ ] Database connection works
- [ ] All API endpoints respond
- [ ] Authentication works
- [ ] File uploads work
- [ ] AI integration works
- [ ] Admin functions work

### ✅ Frontend Testing

- [ ] App loads without errors
- [ ] All pages render correctly
- [ ] Authentication flow works
- [ ] Dashboard loads for all user types
- [ ] Forms submit correctly
- [ ] API integration works
- [ ] Responsive design works

### ✅ Smart Contract Testing

- [ ] Wallet connection works
- [ ] Investment transactions work
- [ ] Project creation works
- [ ] Contract addresses are correct
- [ ] Error handling works
- [ ] Transaction confirmations work

### ✅ Integration Testing

- [ ] Backend-frontend communication works
- [ ] Data persists across sessions
- [ ] Real-time updates work
- [ ] File uploads work end-to-end
- [ ] AI chat works end-to-end

## 🎯 Success Criteria

**The platform is ready for production when:**

1. ✅ All demo accounts work
2. ✅ All user types can access their dashboards
3. ✅ Investment flow works end-to-end
4. ✅ Project creation works end-to-end
5. ✅ Admin functions work
6. ✅ KYC upload works
7. ✅ AI chat works
8. ✅ No console errors
9. ✅ Responsive design works
10. ✅ Smart contract integration works

## 📞 Support

If you encounter issues:

1. Check browser console for errors
2. Check backend logs
3. Verify all services are running
4. Check network connectivity
5. Verify environment variables

**Happy Testing! 🎉**
