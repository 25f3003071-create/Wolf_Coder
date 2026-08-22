const SUPPORTED_CHAINS = {
  sepolia: {
    name: 'Ethereum Sepolia Testnet',
    chainId: 11155111,
    explorerUrl: 'https://sepolia.etherscan.io',
  },
  amoy: {
    name: 'Polygon Amoy Testnet',
    chainId: 80002,
    explorerUrl: 'https://amoy.polygonscan.com',
  },
};

class BlockchainService {
  static isConfigured() {
    return Boolean(
      process.env.SEPOLIA_RPC_URL &&
        process.env.DEPLOYER_PRIVATE_KEY &&
        process.env.DEPLOYER_PRIVATE_KEY !== '0x0000000000000000000000000000000000000000000000000000000000000000'
    );
  }

  static getTxExplorerUrl(txHash, chain = 'sepolia') {
    const config = SUPPORTED_CHAINS[chain] || SUPPORTED_CHAINS.sepolia;
    return `${config.explorerUrl}/tx/${txHash}`;
  }
}

module.exports = BlockchainService;
