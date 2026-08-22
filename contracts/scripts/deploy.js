const { ethers, network } = require("hardhat");

async function main() {
  console.log(`Deploying ReliefTracker contract to network: ${network.name}...`);

  const [deployer] = await ethers.getSigners();
  if (deployer) {
    console.log(`Deploying with wallet address: ${deployer.address}`);
  }

  const ReliefTracker = await ethers.getContractFactory("ReliefTracker");
  const reliefTracker = await ReliefTracker.deploy();
  await reliefTracker.waitForDeployment();

  const contractAddress = await reliefTracker.getAddress();
  console.log("--------------------------------------------------");
  console.log(`SUCCESS: ReliefTracker deployed to: ${contractAddress}`);
  console.log(`Network: ${network.name} (Chain ID: ${network.config.chainId})`);
  console.log("--------------------------------------------------");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
