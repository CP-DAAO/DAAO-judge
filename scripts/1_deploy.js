const { ethers } = require("hardhat");

async function main() {
  const deployer = (await ethers.getSigners())[0];
  console.log(`Deployer: ${deployer.address}, ${await ethers.provider.getBalance(deployer.address)}`);

  const checker = await ethers.deployContract("Checker", [], {});
  await checker.waitForDeployment();
  console.log(`Checker Agent: ${await checker.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).then(() => {
  process.exit();
});
