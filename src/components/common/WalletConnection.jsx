import React from 'react';
import { useWeb3 } from '../contexts/Web3Context';

const WalletConnection = () => {
  const { isConnected, userAddress, isConnecting, error, connectWallet, disconnectWallet } = useWeb3();

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isConnected) {
    return (
      <div className="flex items-center space-x-3">
        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
          {formatAddress(userAddress)}
        </div>
        <button
          onClick={disconnectWallet}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      {error && (
        <div className="text-red-600 text-sm">
          {error}
        </div>
      )}
      <button
        onClick={connectWallet}
        disabled={isConnecting}
        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
    </div>
  );
};

export default WalletConnection;
