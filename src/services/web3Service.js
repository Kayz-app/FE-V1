import { ethers } from 'ethers';
import ProjectABI from '../abis/Project.json';
import PlatformRegistryABI from '../abis/PlatformRegistry.json';
import KayzeraTokenABI from '../abis/KayzeraToken.json';
import SecondaryMarketABI from '../abis/SecondaryMarket.json';

// Contract addresses from Sepolia testnet
const CONTRACT_ADDRESSES = {
  kayzeraToken: '0x55E2e94517b469cEC89f214880d8fD9fdB5b95a4',
  platformRegistry: '0xE3d4526321d3255B68d30cfA6339F682620A8a9f',
  secondaryMarket: '0xFcD2c45E66eB3fcAf030E6E2E66ec6225B94a598'
};

// Sepolia testnet configuration
const NETWORK_CONFIG = {
  chainId: 11155111,
  name: 'Sepolia',
  rpcUrl: 'https://sepolia.infura.io/v3/600e14124b3542018aa0a17e281cc797'
};

class Web3Service {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contracts = {};
    this.isConnected = false;
  }

  // Initialize Web3 connection
  async connectWallet() {
    try {
      if (typeof window.ethereum !== 'undefined') {
        this.provider = new ethers.BrowserProvider(window.ethereum);
        this.signer = await this.provider.getSigner();
        
        // Check if we're on the correct network
        const network = await this.provider.getNetwork();
        if (network.chainId !== BigInt(NETWORK_CONFIG.chainId)) {
          await this.switchToSepolia();
        }
        
        this.isConnected = true;
        this.initializeContracts();
        return this.signer.address;
      } else {
        throw new Error('MetaMask not found. Please install MetaMask.');
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }

  // Switch to Sepolia network
  async switchToSepolia() {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${NETWORK_CONFIG.chainId.toString(16)}` }],
      });
    } catch (switchError) {
      // If the network doesn't exist, add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${NETWORK_CONFIG.chainId.toString(16)}`,
            chainName: NETWORK_CONFIG.name,
            rpcUrls: [NETWORK_CONFIG.rpcUrl],
            nativeCurrency: {
              name: 'Ether',
              symbol: 'ETH',
              decimals: 18,
            },
          }],
        });
      } else {
        throw switchError;
      }
    }
  }

  // Initialize contract instances
  initializeContracts() {
    if (!this.signer) return;

    this.contracts = {
      platformRegistry: new ethers.Contract(
        CONTRACT_ADDRESSES.platformRegistry,
        PlatformRegistryABI,
        this.signer
      ),
      kayzeraToken: new ethers.Contract(
        CONTRACT_ADDRESSES.kayzeraToken,
        KayzeraTokenABI,
        this.signer
      ),
      secondaryMarket: new ethers.Contract(
        CONTRACT_ADDRESSES.secondaryMarket,
        SecondaryMarketABI,
        this.signer
      )
    };
  }

  // Get project contract instance
  getProjectContract(projectAddress) {
    if (!this.signer) throw new Error('Wallet not connected');
    return new ethers.Contract(projectAddress, ProjectABI, this.signer);
  }

  // Investment functions
  async investInProject(projectAddress, amount) {
    try {
      const projectContract = this.getProjectContract(projectAddress);
      const tx = await projectContract.invest(ethers.parseEther(amount.toString()));
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error('Investment failed:', error);
      throw error;
    }
  }

  // Project creation functions
  async createProject(fundingGoal, apyRate, termMonths, totalTokenSupplyCap) {
    try {
      const tx = await this.contracts.platformRegistry.createProject(
        ethers.parseEther(fundingGoal.toString()),
        apyRate,
        termMonths,
        totalTokenSupplyCap
      );
      const receipt = await tx.wait();
      
      // Extract project address from event
      const projectCreatedEvent = receipt.logs.find(
        log => log.topics[0] === ethers.id('ProjectCreated(address,address,uint256,uint256)')
      );
      
      if (projectCreatedEvent) {
        const decoded = this.contracts.platformRegistry.interface.parseLog(projectCreatedEvent);
        return decoded.args.project;
      }
      
      throw new Error('Project creation event not found');
    } catch (error) {
      console.error('Project creation failed:', error);
      throw error;
    }
  }

  // Wallet functions
  async getTokenBalance(tokenId, userAddress) {
    try {
      const balance = await this.contracts.kayzeraToken.balanceOf(userAddress, tokenId);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Failed to get token balance:', error);
      throw error;
    }
  }

  async transferTokens(tokenId, to, amount) {
    try {
      const tx = await this.contracts.kayzeraToken.safeTransferFrom(
        await this.signer.getAddress(),
        to,
        tokenId,
        ethers.parseEther(amount.toString()),
        '0x'
      );
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error('Token transfer failed:', error);
      throw error;
    }
  }

  // Secondary market functions
  async listTokenForSale(tokenId, amount, price) {
    try {
      const tx = await this.contracts.secondaryMarket.listToken(
        tokenId,
        ethers.parseEther(amount.toString()),
        ethers.parseEther(price.toString())
      );
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error('Token listing failed:', error);
      throw error;
    }
  }

  async buyTokenFromMarket(listingId, amount) {
    try {
      const tx = await this.contracts.secondaryMarket.buyToken(
        listingId,
        ethers.parseEther(amount.toString())
      );
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error('Token purchase failed:', error);
      throw error;
    }
  }

  // Developer functions
  async withdrawProjectCapital(projectAddress) {
    try {
      const projectContract = this.getProjectContract(projectAddress);
      const tx = await projectContract.withdrawCapital();
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error('Capital withdrawal failed:', error);
      throw error;
    }
  }

  async depositApyFunds(projectAddress, amount) {
    try {
      const projectContract = this.getProjectContract(projectAddress);
      const tx = await projectContract.depositApyFunds(ethers.parseEther(amount.toString()));
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error('APY deposit failed:', error);
      throw error;
    }
  }

  async claimApy(projectAddress) {
    try {
      const projectContract = this.getProjectContract(projectAddress);
      const tx = await projectContract.claimApy();
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error('APY claim failed:', error);
      throw error;
    }
  }

  // Utility functions
  async getProjectDetails(projectAddress) {
    try {
      const projectContract = this.getProjectContract(projectAddress);
      const [
        amountRaised,
        fundingGoal,
        apyBasisPoints,
        termMonths,
        status,
        developer
      ] = await Promise.all([
        projectContract.amountRaised(),
        projectContract.fundingGoal(),
        projectContract.apyBasisPoints(),
        projectContract.termMonths(),
        projectContract.status(),
        projectContract.developer()
      ]);

      return {
        amountRaised: parseFloat(ethers.formatEther(amountRaised)),
        fundingGoal: parseFloat(ethers.formatEther(fundingGoal)),
        apy: apyBasisPoints / 100, // Convert basis points to percentage
        termMonths: Number(termMonths),
        status: Number(status),
        developer
      };
    } catch (error) {
      console.error('Failed to get project details:', error);
      throw error;
    }
  }

  async getAllProjects() {
    try {
      const projectAddresses = await this.contracts.platformRegistry.getAllProjects();
      return projectAddresses;
    } catch (error) {
      console.error('Failed to get all projects:', error);
      throw error;
    }
  }

  // Check if user is connected
  isWalletConnected() {
    return this.isConnected && this.signer !== null;
  }

  // Get current user address
  async getCurrentAddress() {
    if (!this.signer) return null;
    return await this.signer.getAddress();
  }

  // Disconnect wallet
  disconnect() {
    this.provider = null;
    this.signer = null;
    this.contracts = {};
    this.isConnected = false;
  }
}

// Create singleton instance
const web3Service = new Web3Service();

export default web3Service;
