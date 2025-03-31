// Contract addresses for different networks
interface NetworkAddresses {
  [key: string]: {
    ARTIST_DONATION: string;
    CUSD_TOKEN: string;
    COOKIES_TOKEN: string;
    NFT_FACTORY: string;
    ARTIST_STAKING: string;
  };
}

// Get environment variables with fallbacks
const getEnvVar = (name: string, fallback: string = ''): string => {
  if (import.meta.env[`VITE_${name}`]) {
    return import.meta.env[`VITE_${name}`];
  }
  
  // For local development, window might be available with env variables
  if (typeof window !== 'undefined' && (window as any).__env && (window as any).__env[name]) {
    return (window as any).__env[name];
  }
  
  return fallback;
};

const NETWORK_ADDRESSES: NetworkAddresses = {
  // Celo Alfajores Testnet
  44787: {
    ARTIST_DONATION: getEnvVar('ARTIST_DONATION_ADDRESS', '0xc6724370cB2CD753189Ee8Ed52a1Ffeaae92e687'),
    CUSD_TOKEN: getEnvVar('STABLECOIN_ADDRESS', '0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B'),
    COOKIES_TOKEN: getEnvVar('COOKIES_TOKEN_ADDRESS', '0xf981A370B218bF8a7E7205F4dA5dd9aBD96649d6'),
    NFT_FACTORY: getEnvVar('NFT_FACTORY_ADDRESS', '0x9A5D90657CCa0849DB08C590f3eD16cBE4965397'),
    ARTIST_STAKING: getEnvVar('ARTIST_STAKING_ADDRESS', '0x964c2578FAaF895624F761326d4113031eabA147'),
  },
  // Celo Mainnet for future reference
  42220: {
    ARTIST_DONATION: '', // To be deployed on mainnet
    CUSD_TOKEN: '0x765DE816845861e75A25fCA122bb6898B8B1282a', // Mainnet cUSD token address
    COOKIES_TOKEN: '', // To be deployed on mainnet
    NFT_FACTORY: '', // To be deployed on mainnet
    ARTIST_STAKING: '', // To be deployed on mainnet
  },
};

// Default to Alfajores testnet if network is not detected
const DEFAULT_CHAIN_ID = 44787;

// Get the current network's contract addresses
export const getCurrentNetworkAddresses = (chainId: number = DEFAULT_CHAIN_ID) => {
  return NETWORK_ADDRESSES[chainId] || NETWORK_ADDRESSES[DEFAULT_CHAIN_ID];
};

// Export contract addresses for easy access
export const ARTIST_DONATION_ADDRESS = NETWORK_ADDRESSES[DEFAULT_CHAIN_ID].ARTIST_DONATION;
export const CUSD_TOKEN_ADDRESS = NETWORK_ADDRESSES[DEFAULT_CHAIN_ID].CUSD_TOKEN;
export const COOKIES_TOKEN_ADDRESS = NETWORK_ADDRESSES[DEFAULT_CHAIN_ID].COOKIES_TOKEN;
export const NFT_FACTORY_ADDRESS = NETWORK_ADDRESSES[DEFAULT_CHAIN_ID].NFT_FACTORY;
export const ARTIST_STAKING_ADDRESS = NETWORK_ADDRESSES[DEFAULT_CHAIN_ID].ARTIST_STAKING; 