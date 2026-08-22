const hre = require("hardhat");

async function main() {
  console.log("Deploying ReliefTracker smart contract...");

  const ReliefTracker = await hre.ethers.getContractFactory("ReliefTracker");
  const reliefTracker = await ReliefTracker.deploy();

  await reliefTracker.waitForDeployment();
  const address = await reliefTracker.getAddress();

  console.log(`ReliefTracker deployed successfully to address: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
