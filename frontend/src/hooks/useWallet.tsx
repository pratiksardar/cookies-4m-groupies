import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { BrowserProvider, JsonRpcSigner } from 'ethers';

// Celo Networks
const NETWORKS = {
  ALFAJORES: {
    chainId: '0xaef3', // 44787 in hex
    chainName: 'Celo Alfajores Testnet',
    nativeCurrency: {
      name: 'Celo',
      symbol: 'CELO',
      decimals: 18,
    },
    rpcUrls: ['https://alfajores-forno.celo-testnet.org'],
    blockExplorerUrls: ['https://explorer.celo.org/alfajores'],
  },
  MAINNET: {
    chainId: '0xa4ec', // 42220 in hex
    chainName: 'Celo Mainnet',
    nativeCurrency: {
      name: 'Celo',
      symbol: 'CELO',
      decimals: 18,
    },
    rpcUrls: ['https://forno.celo.org'],
    blockExplorerUrls: ['https://explorer.celo.org'],
  },
};

interface WalletContextType {
  address: string | null;
  signer: JsonRpcSigner | null;
  provider: BrowserProvider | null;
  connect: (walletId: string) => Promise<void>;
  disconnect: () => void;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  network: string | null;
  chainId: number | null;
  switchToAlfajores: () => Promise<boolean>;
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  signer: null,
  provider: null,
  connect: async () => {},
  disconnect: () => {},
  isModalOpen: false,
  openModal: () => {},
  closeModal: () => {},
  network: null,
  chainId: null,
  switchToAlfajores: async () => false,
});

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [address, setAddress] = useState<string | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [network, setNetwork] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Function to switch to Alfajores testnet
  const switchToAlfajores = async (): Promise<boolean> => {
    if (!window.ethereum) return false;

    try {
      // Try to switch to the network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: NETWORKS.ALFAJORES.chainId }],
      });
      return true;
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [NETWORKS.ALFAJORES],
          });
          return true;
        } catch (addError) {
          console.error('Error adding Alfajores network:', addError);
          return false;
        }
      }
      console.error('Error switching to Alfajores network:', switchError);
      return false;
    }
  };

  const updateNetworkStatus = async () => {
    if (!provider) return;
    
    try {
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      setChainId(chainId);
      
      if (chainId === 44787) {
        setNetwork('Celo Alfajores Testnet');
      } else if (chainId === 42220) {
        setNetwork('Celo Mainnet');
      } else {
        setNetwork(`Unknown Network (${chainId})`);
      }
    } catch (error) {
      console.error('Error getting network:', error);
    }
  };

  const connect = async (walletId: string) => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        let provider;
        switch (walletId) {
          case 'metamask':
            if (!window.ethereum.isMetaMask) {
              window.open('https://metamask.io/download/', '_blank');
              return;
            }
            provider = new BrowserProvider(window.ethereum);
            break;
          case 'coinbase':
            if (!window.ethereum.isCoinbaseWallet) {
              window.open('https://www.coinbase.com/wallet/downloads', '_blank');
              return;
            }
            provider = new BrowserProvider(window.ethereum);
            break;
          case 'rabby':
            if (!window.ethereum.isRabby) {
              window.open('https://rabby.io/', '_blank');
              return;
            }
            provider = new BrowserProvider(window.ethereum);
            break;
          case 'phantom':
            if (!window.ethereum.isPhantom) {
              window.open('https://phantom.app/download', '_blank');
              return;
            }
            provider = new BrowserProvider(window.ethereum);
            break;
          case 'rainbow':
            if (!window.ethereum.isRainbow) {
              window.open('https://rainbow.me/', '_blank');
              return;
            }
            provider = new BrowserProvider(window.ethereum);
            break;
          default:
            throw new Error('Unsupported wallet');
        }

        // Try to switch to Alfajores
        await switchToAlfajores();

        const accounts = await provider.send('eth_requestAccounts', []);
        const signer = await provider.getSigner();
        
        setProvider(provider);
        setSigner(signer);
        setAddress(accounts[0]);
        closeModal();
        
        // Update network status
        await updateNetworkStatus();
      } catch (error) {
        console.error('Error connecting to wallet:', error);
      }
    } else {
      alert('Please install a Web3 wallet to use this feature');
    }
  };

  const disconnect = () => {
    setAddress(null);
    setSigner(null);
    setProvider(null);
    setNetwork(null);
    setChainId(null);
  };

  useEffect(() => {
    // Update network status when provider changes
    if (provider) {
      updateNetworkStatus();
    }
  }, [provider]);

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect();
        } else {
          setAddress(accounts[0]);
        }
      });

      window.ethereum.on('chainChanged', () => {
        // Refresh provider and update network status
        if (provider) {
          updateNetworkStatus();
        } else {
          window.location.reload();
        }
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
        window.ethereum.removeListener('chainChanged', () => {});
      }
    };
  }, [provider]);

  return (
    <WalletContext.Provider 
      value={{ 
        address, 
        signer, 
        provider, 
        connect, 
        disconnect,
        isModalOpen,
        openModal,
        closeModal,
        network,
        chainId,
        switchToAlfajores,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}