require("@nomicfoundation/hardhat-toolbox");
try {
  require("dotenv").config({ path: "../.env.local" });
} catch (err) {
  // dotenv optional if env vars are already set or defaulted
}

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org";
const POLYGON_AMOY_RPC_URL = process.env.POLYGON_AMOY_RPC_URL || "https://rpc-amoy.polygon.technology";
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  networks: {
    hardhat: {
      chainId: 31337
    },
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: DEPLOYER_PRIVATE_KEY !== "0x0000000000000000000000000000000000000000000000000000000000000000" ? [DEPLOYER_PRIVATE_KEY] : [],
      chainId: 11155111
    },
    amoy: {
      url: POLYGON_AMOY_RPC_URL,
      accounts: DEPLOYER_PRIVATE_KEY !== "0x0000000000000000000000000000000000000000000000000000000000000000" ? [DEPLOYER_PRIVATE_KEY] : [],
      chainId: 80002
    }
  }
};
