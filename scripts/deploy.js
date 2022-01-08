async function main() {
  // We get the contract to deploy
  const Seniority_Badge = await ethers.getContractFactory("SeniorityBadge");
  const deployment = await Seniority_Badge.deploy();

  console.log("Seniority_Badge deployed to:", deployment.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
