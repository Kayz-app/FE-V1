# Smart Contract Integration Guide

## Overview

This frontend application has been integrated with smart contracts deployed on the Sepolia testnet. The integration provides blockchain functionality for real estate tokenization and investment.

## 🚀 Quick Start

### Prerequisites
- **MetaMask** wallet installed
- **Sepolia ETH** for gas fees
- **Node.js** v20.11.1+ (compatible with current Vite version)

### Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Connect MetaMask:**
   - Click "Connect Wallet" in the header
   - Ensure you're on Sepolia testnet
   - Add Sepolia ETH for gas fees

## 📋 Smart Contract Integration Points

### 1. **Investment Transactions** ✅
- **Location**: `src/App.jsx` - `handleInvest()` function
- **Contract**: Individual Project contracts
- **Function**: `invest(uint256 amount)`
- **Features**:
  - Real-time transaction processing
  - Gas estimation and confirmation
  - Error handling and user feedback
  - Transaction hash display

### 2. **Project Creation** ✅
- **Location**: `src/components/dashboard/developer/DeveloperCreateProject.jsx`
- **Contract**: PlatformRegistry
- **Function**: `createProject(fundingGoal, apyRate, termMonths, totalTokenSupplyCap)`
- **Features**:
  - Blockchain project deployment
  - Contract address retrieval
  - Form validation and submission
  - Loading states and error handling

### 3. **Wallet Operations** ✅
- **Location**: `src/components/dashboard/investor/CryptoWallet.jsx`
- **Contract**: KayzeraToken (ERC1155)
- **Functions**: Deposit/Withdraw operations
- **Features**:
  - Real wallet address display
  - Copy-to-clipboard functionality
  - Transaction simulation
  - Connection status validation

### 4. **Web3 Service Layer** ✅
- **Location**: `src/services/web3Service.js`
- **Features**:
  - MetaMask integration
  - Network switching (Sepolia)
  - Contract instance management
  - Transaction handling
  - Error management

### 5. **Context Management** ✅
- **Location**: `src/contexts/Web3Context.jsx`
- **Features**:
  - Global Web3 state
  - Wallet connection management
  - Account change detection
  - Network change handling

## 🔧 Contract Addresses (Sepolia)

```javascript
const CONTRACT_ADDRESSES = {
  kayzeraToken: '0x55E2e94517b469cEC89f214880d8fD9fdB5b95a4',
  platformRegistry: '0xE3d4526321d3255B68d30cfA6339F682620A8a9f',
  secondaryMarket: '0xFcD2c45E66eB3fcAf030E6E2E66ec6225B94a598'
};
```

## 📁 File Structure

```
src/
├── services/
│   └── web3Service.js          # Main Web3 service
├── contexts/
│   └── Web3Context.jsx         # Web3 context provider
├── components/
│   ├── common/
│   │   ├── WalletConnection.jsx # Wallet connection UI
│   │   └── Header.jsx          # Updated with wallet connection
│   ├── dashboard/
│   │   ├── developer/
│   │   │   └── DeveloperCreateProject.jsx # Project creation
│   │   └── investor/
│   │       └── CryptoWallet.jsx # Wallet operations
├── abis/
│   ├── Project.json            # Project contract ABI
│   ├── PlatformRegistry.json   # Registry contract ABI
│   ├── KayzeraToken.json       # Token contract ABI
│   └── SecondaryMarket.json    # Market contract ABI
└── App.jsx                     # Main app with investment integration
```

## 🎯 Key Features Implemented

### Investment Flow
1. **Wallet Connection**: Users must connect MetaMask
2. **Project Selection**: Choose from available projects
3. **Investment Amount**: Enter investment amount
4. **Blockchain Transaction**: Smart contract call
5. **Confirmation**: Transaction hash and success message

### Project Creation Flow
1. **Developer Login**: Access developer dashboard
2. **Form Completion**: Fill project details
3. **Blockchain Deployment**: Create project contract
4. **Address Retrieval**: Get deployed contract address
5. **Success Confirmation**: Display contract address

### Wallet Operations
1. **Deposit**: Display user's wallet address
2. **Withdraw**: Simulate token transfers
3. **Address Management**: Copy-to-clipboard functionality
4. **Connection Status**: Real-time wallet status

## 🔒 Security Features

- **Network Validation**: Automatic Sepolia network switching
- **Transaction Validation**: Gas estimation and confirmation
- **Error Handling**: Comprehensive error management
- **User Feedback**: Clear success/error messages
- **Connection Status**: Real-time wallet connection monitoring

## 🚨 Important Notes

### Mock Data vs Real Contracts
- **Projects**: Include mock `contractAddress` fields
- **Transactions**: Simulated for demo purposes
- **Balances**: Mock wallet balances (not blockchain-based)
- **Tokens**: Mock token creation (not ERC1155 minting)

### Production Considerations
1. **Replace Mock Addresses**: Use real deployed contract addresses
2. **Implement Real Token Operations**: Connect to actual ERC1155 contracts
3. **Add Real Balance Fetching**: Query blockchain for actual balances
4. **Implement Event Listening**: Listen for contract events
5. **Add Transaction History**: Display real transaction history

## 🛠 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

## 📱 User Experience

### For Investors
- Connect wallet to invest
- View real-time transaction status
- Copy wallet addresses for deposits
- Receive transaction confirmations

### For Developers
- Create projects on blockchain
- Deploy smart contracts
- Manage project funding
- Monitor project status

### For All Users
- Seamless wallet integration
- Network switching
- Error handling and feedback
- Responsive design

## 🔄 Next Steps

1. **Replace Mock Data**: Connect to real blockchain data
2. **Implement Event Listening**: Listen for contract events
3. **Add Transaction History**: Display real transaction history
4. **Implement Secondary Market**: Connect to market contracts
5. **Add APY Claims**: Implement reward claiming functionality
6. **Add Admin Functions**: Connect admin operations to contracts

## 📞 Support

For issues or questions about the smart contract integration:
- Check MetaMask connection
- Ensure Sepolia network is selected
- Verify sufficient ETH for gas fees
- Check browser console for errors

---

**Note**: This integration provides a foundation for blockchain functionality. For production deployment, additional security measures and real contract interactions should be implemented.
