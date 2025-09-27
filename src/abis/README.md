# Contract ABIs

This folder contains the Application Binary Interfaces (ABIs) for all Kayzera platform smart contracts.

## Files

- **`KayzeraToken.json`** - ERC1155 token contract ABI for security and market tokens
- **`PlatformRegistry.json`** - Main platform registry contract ABI for project management
- **`SecondaryMarket.json`** - Secondary market contract ABI for token trading
- **`Project.json`** - Individual project contract ABI for investment management

## Usage

These ABIs can be used with web3 libraries like ethers.js or web3.js to interact with the deployed contracts:

```javascript
// Example with ethers.js
const contractABI = require('./abis/KayzeraToken.json');
const contract = new ethers.Contract(contractAddress, contractABI, signer);
```

## Contract Addresses (Sepolia)

- **KayzeraToken Proxy**: `0x55E2e94517b469cEC89f214880d8fD9fdB5b95a4`
- **PlatformRegistry Proxy**: `0xE3d4526321d3255B68d30cfA6339F682620A8a9f`
- **SecondaryMarket Proxy**: `0xFcD2c45E66eB3fcAf030E6E2E66ec6225B94a598`

## Verification Status

All contracts are verified on Etherscan Sepolia:
- [KayzeraToken](https://sepolia.etherscan.io/address/0x9Da8Ed705018eDE4dcaf8F71B31DC30b78156d04#code)
- [PlatformRegistry](https://sepolia.etherscan.io/address/0x69ccA737c4e0D7239e45c61cd607E83011922b66#code)
- [SecondaryMarket](https://sepolia.etherscan.io/address/0x1305805003561bEE1Dc8C1FacA5003027333712f#code)

## Network Information

- **Network**: Sepolia Testnet
- **Chain ID**: 11155111
- **RPC URL**: https://sepolia.infura.io/v3/600e14124b3542018aa0a17e281cc797
