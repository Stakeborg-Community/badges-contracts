const hre = require("hardhat");

async function main() {
  // We get the contract to deploy

  console.log("Deploy script");

  const Contract = await ethers.getContractFactory("SeniorityBadge");
  const contract = await Contract.deploy();

  await contract.deployed();

  // This solves the bug in Mumbai network where the contract address is not the real one
  const txHash = contract.deployTransaction.hash;
  console.log(`Tx hash: ${txHash}\nWaiting for transaction to be mined...`);
  const txReceipt = await ethers.provider.waitForTransaction(txHash);

  console.log("Contract address:", txReceipt.contractAddress);

  await hre.run("verify:verify", {
    address: txReceipt.contractAddress,
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
