export interface ChainConfig {
  name: string;
  chainId: number;
  contractAddress: string;
  rpcUrl: string;
  explorerUrl: string;
}

export const SUPPORTED_CHAINS: Record<string, ChainConfig> = {
  sepolia: {
    name: 'Ethereum Sepolia Testnet',
    chainId: 11155111,
    contractAddress: process.env.NEXT_PUBLIC_RELIEF_TRACKER_ADDRESS || '0x1111111111111111111111111111111111111111',
    rpcUrl: process.env.SEPOLIA_RPC_URL || 'https://rpc.sepolia.org',
    explorerUrl: 'https://sepolia.etherscan.io',
  },
  amoy: {
    name: 'Polygon Amoy Testnet',
    chainId: 80002,
    contractAddress: process.env.NEXT_PUBLIC_RELIEF_TRACKER_ADDRESS_AMOY || '0x2222222222222222222222222222222222222222',
    rpcUrl: process.env.POLYGON_AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology',
    explorerUrl: 'https://amoy.polygonscan.com',
  },
};

export function getExplorerTxUrl(txHash: string, chain: string = 'sepolia'): string {
  const config = SUPPORTED_CHAINS[chain] || SUPPORTED_CHAINS.sepolia;
  return `${config.explorerUrl}/tx/${txHash}`;
}

export function isBlockchainConfigured(): boolean {
  return Boolean(
    process.env.SEPOLIA_RPC_URL &&
      process.env.DEPLOYER_PRIVATE_KEY &&
      process.env.DEPLOYER_PRIVATE_KEY !== '0x0000000000000000000000000000000000000000000000000000000000000000'
  );
}
