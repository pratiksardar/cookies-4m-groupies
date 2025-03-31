import React from 'react';
import { useWallet } from '../hooks/useWallet';

export const NetworkIndicator: React.FC = () => {
  const { network, chainId, switchToAlfajores } = useWallet();

  const getNetworkColor = () => {
    if (!chainId) return 'gray';
    
    // 44787 is Celo Alfajores Testnet
    if (chainId === 44787) return 'green';
    
    // 42220 is Celo Mainnet
    if (chainId === 42220) return 'blue';
    
    // Unknown network
    return 'red';
  };

  const handleSwitchNetwork = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (chainId !== 44787) {
      await switchToAlfajores();
    }
  };

  if (!network) return null;

  return (
    <div className="flex items-center">
      <div 
        className={`w-3 h-3 rounded-full mr-2 bg-${getNetworkColor()}-500`}
        title={network}
      ></div>
      <span className="text-sm mr-2">{network}</span>
      {chainId !== 44787 && (
        <button 
          onClick={handleSwitchNetwork}
          className="text-xs px-2 py-1 bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors"
        >
          Switch to Alfajores
        </button>
      )}
    </div>
  );
}; 