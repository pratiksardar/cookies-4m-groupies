import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { BrowserProvider, JsonRpcSigner } from 'ethers';

interface WalletContextType {
  address: string | null;
  signer: JsonRpcSigner | null;
  provider: BrowserProvider | null;
  connect: (walletId: string) => Promise<void>;
  disconnect: () => void;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  signer: null,
  provider: null,
  connect: async () => {},
  disconnect: () => {},
  isModalOpen: false,
  openModal: () => {},
  closeModal: () => {}
});

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [address, setAddress] = useState<string | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

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

        const accounts = await provider.send('eth_requestAccounts', []);
        const signer = await provider.getSigner();
        
        setProvider(provider);
        setSigner(signer);
        setAddress(accounts[0]);
        closeModal();
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
  };

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
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
        window.ethereum.removeListener('chainChanged', () => {});
      }
    };
  }, []);

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
        closeModal
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}