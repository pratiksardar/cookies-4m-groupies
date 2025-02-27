require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0000000000000000000000000000000000000000000000000000000000000000";

const config = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 1337
    },
    "alfajores": {
      url: "https://alfajores-forno.celo-testnet.org",
      accounts: [PRIVATE_KEY],
      chainId: 44787,
      gasPrice: "auto"
    },
    "celo": {
      url: "https://rpc.ankr.com/celo",
      accounts: [PRIVATE_KEY],
      chainId: 42220,
      gasPrice: "auto"
    }
  },
  etherscan: {
    apiKey: {
      "alfajores": process.env.CELOSCAN_API_KEY || "",
      "celo": process.env.CELOSCAN_API_KEY || ""
    },
    customChains: [
      {
        network: "alfajores",
        chainId: 44787,
        urls: {
          apiURL: "https://api-alfajores.celoscan.io/api",
          browserURL: "https://alfajores.celoscan.io"
        }
      },
      {
        network: "celo",
        chainId: 42220,
        urls: {
          apiURL: "https://api.celoscan.io/api",
          browserURL: "https://celoscan.io"
        }
      }
    ]
  }
};

module.exports = config;