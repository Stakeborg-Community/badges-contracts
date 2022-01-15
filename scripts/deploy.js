const hre = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());
  // We get the contract to deploy
  const Seniority_Badge = await hre.ethers.getContractFactory("SeniorityBadge");
  const deployment = await hre.upgrades.deployProxy(Seniority_Badge);

  await deployment.deployed();

  console.log("Seniority_Badge deployed to:", deployment.address);

  console.log(
    "Implementation address: ",
    await hre.upgrades.erc1967.getImplementationAddress(deployment.address)
  );

  await hre.run("verify:verify", {
    address: await hre.upgrades.erc1967.getImplementationAddress(
      deployment.address
    ),
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
