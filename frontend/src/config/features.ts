export const features = {
  theme: {
    // Set to 'system' to follow system preference
    // Set to 'light' or 'dark' to force a specific theme
    mode: 'system' as 'system' | 'light' | 'dark',
    
    // Enable/disable theme toggle in UI
    allowToggle: false
  },

  contracts: {
    // Enable/disable smart contract deployment
    deployment: {
      enabled: true,
      
      // Contract addresses (filled after deployment)
      addresses: {
        cookiesToken: '',
        nftFactory: '',
        artistDonation: '',
        artistStaking: '',
        stableCoinStaking: ''
      }
    }
  }
} as const;