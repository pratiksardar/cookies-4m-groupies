# Contract Deployment Guide

This guide will help you deploy the smart contracts to the Celo Alfajores testnet and configure the frontend to use them.

## Prerequisites

1. Make sure you have Node.js and npm installed
2. Install dependencies in both the root directory and smart-contracts directory:
   ```
   npm install
   cd smart-contracts && npm install
   ```
3. Set up environment variables by creating a `.env` file in the `smart-contracts` directory:
   ```
   PRIVATE_KEY=your_wallet_private_key
   PLATFORM_WALLET_ADDRESS=your_platform_wallet_address
   CELOSCAN_API_KEY=your_celoscan_api_key  # Optional, for contract verification
   ```

## Deploy Contracts

The contracts can be deployed using either Hardhat or Foundry.

### Option 1: Deploying with Hardhat (Recommended)

1. Run the deployment script:
   ```
   cd smart-contracts
   ./deploy-alfajores.sh
   ```

2. After deployment, update the frontend contract addresses:
   ```
   cd ..
   node scripts/update-frontend-contracts.js
   ```

### Option 2: Deploying Individual Contracts with Foundry

1. First deploy the CookiesToken:
   ```
   cd smart-contracts
   forge script scripts/DeployCookiesToken.s.sol --rpc-url alfajores --broadcast
   ```

2. Export the token address to environment variables:
   ```
   export COOKIES_TOKEN_ADDRESS=deployed_token_address
   ```

3. Deploy the StableCoinStaking contract:
   ```
   export STABLECOIN_ADDRESS=0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1
   forge script scripts/DeployStableCoinStaking.s.sol --rpc-url alfajores --broadcast
   ```

4. Manually update the contract addresses in `frontend/src/config/contracts.ts` and `frontend/src/config/features.ts`

## Verifying Contracts (Optional)

After deployment, you can verify the contracts on Celoscan using the commands printed by the deployment script, or manually:

```
cd smart-contracts
npx hardhat verify --network alfajores COOKIES_TOKEN_ADDRESS
npx hardhat verify --network alfajores STABLE_COIN_STAKING_ADDRESS COOKIES_TOKEN_ADDRESS STABLECOIN_ADDRESS
```

## Testing the Deployed Contracts

1. Make sure the frontend is configured to use the Alfajores testnet
2. Get some testnet CELO and cUSD from the [Celo Faucet](https://faucet.celo.org/alfajores)
3. Run the test script to interact with the contracts directly:
   ```
   cd smart-contracts
   npx hardhat run scripts/test-staking.js --network alfajores
   ```
4. Run the frontend application:
   ```
   cd frontend
   npm run dev
   ```
5. Connect your wallet and test the staking functionality in the UI

## Troubleshooting

- If deployment fails, check that your wallet has enough CELO for gas fees
- If contract verification fails, try again with the `--force` flag
- If the frontend can't connect to the contracts, make sure the contract addresses are correctly updated in the configuration files 