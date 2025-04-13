#!/bin/bash

# Script to deploy contracts to Alfajores testnet

echo "Deploying contracts to Alfajores testnet..."

# Make sure environment variables are set
if [ -z "$PRIVATE_KEY" ]; then
  echo "Error: PRIVATE_KEY environment variable not set"
  exit 1
fi

if [ -z "$PLATFORM_WALLET_ADDRESS" ]; then
  echo "Error: PLATFORM_WALLET_ADDRESS environment variable not set"
  exit 1
fi

# Deploy using hardhat
npx hardhat run scripts/deploy.ts --network alfajores

echo "Deployment completed!"
echo "Note: Contract addresses have been updated in the features.ts file"
echo "To verify contracts, use the commands printed above" 