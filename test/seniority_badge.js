const { expect } = require("chai");

describe("Seniority Badge Contract", function () {
  let contract, deployment;

  let owner;
  let userAddr1;
  let userAddr2;
  let userAddrs;

  beforeEach(async function () {
    contract = await ethers.getContractFactory("SeniorityBadge");
    deployment = await contract.deploy();
    [owner, userAddr1, userAddr2, ...userAddrs] = await ethers.getSigners();
  });

  describe("Deployment", function () {
    it("Should deploy with ERC721 name and symbol", async function () {
      expect(await deployment.name()).to.equal("Seniority Badge");
      expect(await deployment.symbol()).to.equal("SEN");
    });

    it("Should set the right owner", async function () {
      expect(await deployment.owner()).to.equal(owner.address);
    });

    it("Should start paused", async function () {
      expect(await deployment.paused()).to.equal(true);
    });

    xit("Others should not be able to unpause", async function () {
      expect(await deployment.connect(userAddr1).unpause()).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
      expect(await deployment.paused()).to.equal(true);
    });

    it("Owner should be able to unpause", async function () {
      await deployment.connect(owner).unpause();
      expect(await deployment.paused()).to.equal(false);
    });

    xit("Others should not be able to pause", async function () {
      await deployment.connect(owner).unpause();
      expect(await deployment.connect(userAddr1).pause()).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
      expect(await deployment.paused()).to.equal(false);
    });

    it("Owner should be able to pause", async function () {
      await deployment.connect(owner).unpause();
      await deployment.connect(owner).pause();
      expect(await deployment.paused()).to.equal(true);
    });
  });

  describe("Roles", function () {});
  describe("Whitelist", function () {});
  describe("Mint", function () {});
  describe("Transactions", function () {});
});
