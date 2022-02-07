const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
const {
  expectRevert, // Assertions for transactions that should fail
} = require("@openzeppelin/test-helpers");
const { BigNumber } = require("ethers");

const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");
const whitelistAddresses = require("./../data/whitelist.json");

describe("Seniority Badge Contract", function () {
  let contract, deployment;

  let owner;
  let userAddr1;
  let userAddr2;
  let userAddr3;
  let userAddr4;
  let userAddr5;
  let userAddrs;

  let leafNodes, tree;

  beforeEach(async function () {
    contract = await ethers.getContractFactory("SeniorityBadge");
    deployment = await upgrades.deployProxy(contract);

    await deployment.deployed();

    [
      owner,
      userAddr1, //whitelisted
      userAddr2,
      userAddr3,
      userAddr4, //not whitelisted
      userAddr5,
      ...userAddrs
    ] = await ethers.getSigners();

    leaves = whitelistAddresses.map((addr) => keccak256(addr));
    tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  });

  describe("Deployment", function () {
    it("Should deploy paused", async function () {
      expect(await deployment.paused()).to.equal(true);
    });

    it("Should deploy with set variables", async function () {
      expect(await deployment.BOOTSTRAPPER()).to.equal(BigNumber.from(0));
      expect(await deployment.VETERAN()).to.equal(BigNumber.from(1));
      expect(await deployment.ADOPTER()).to.equal(BigNumber.from(2));
      expect(await deployment.SUSTAINER()).to.equal(BigNumber.from(3));
      expect(await deployment.BELIEVER()).to.equal(BigNumber.from(4));

      expect(await deployment.BOOTSTRAPPER_SUPPLY()).to.equal(
        BigNumber.from(50)
      );
      expect(await deployment.VETERAN_SUPPLY()).to.equal(BigNumber.from(100));
      expect(await deployment.ADOPTER_SUPPLY()).to.equal(BigNumber.from(250));
      expect(await deployment.SUSTAINER_SUPPLY()).to.equal(BigNumber.from(500));
      expect(await deployment.BELIEVER_SUPPLY()).to.equal(BigNumber.from(1000));
    });

    it("Should deploy with set URI", async function () {
      await deployment.connect(owner).unpause();

      expect(await deployment.uri(0)).to.equal(
        "https://stakeborgdao.xyz/api/badge/seniority/{id}.json"
      );
    });
  });

  describe("Roles", function () {
    it("Owner should set URI_SETTER_ROLE, PAUSER_ROLE, UPGRADER_ROLE, WHITELISTER_ROLE role", async function () {
      await deployment.connect(owner).unpause();

      let URI_SETTER_ROLE = await deployment.URI_SETTER_ROLE();
      let PAUSER_ROLE = await deployment.PAUSER_ROLE();
      let UPGRADER_ROLE = await deployment.UPGRADER_ROLE();
      let WHITELISTER_ROLE = await deployment.WHITELISTER_ROLE();

      await deployment
        .connect(owner)
        .grantRole(URI_SETTER_ROLE, userAddr1.address);
      await deployment.connect(owner).grantRole(PAUSER_ROLE, userAddr1.address);
      await deployment
        .connect(owner)
        .grantRole(UPGRADER_ROLE, userAddr1.address);
      await deployment
        .connect(owner)
        .grantRole(WHITELISTER_ROLE, userAddr1.address);

      expect(
        await deployment.hasRole(URI_SETTER_ROLE, userAddr1.address)
      ).to.equal(true);
      expect(await deployment.hasRole(PAUSER_ROLE, userAddr1.address)).to.equal(
        true
      );
      expect(
        await deployment.hasRole(UPGRADER_ROLE, userAddr1.address)
      ).to.equal(true);
      expect(
        await deployment.hasRole(WHITELISTER_ROLE, userAddr1.address)
      ).to.equal(true);
    });

    it("URI_SETTER_ROLE should not set URI_SETTER_ROLE role", async function () {
      await deployment.connect(owner).unpause();

      let URI_SETTER_ROLE = await deployment.URI_SETTER_ROLE();

      await deployment
        .connect(owner)
        .grantRole(URI_SETTER_ROLE, userAddr1.address);
      await expectRevert.unspecified(
        deployment
          .connect(userAddr1)
          .grantRole(URI_SETTER_ROLE, userAddr2.address)
      );

      expect(
        await deployment.hasRole(URI_SETTER_ROLE, userAddr1.address)
      ).to.equal(true);
      expect(
        await deployment.hasRole(URI_SETTER_ROLE, userAddr2.address)
      ).to.equal(false);
    });
    it("PAUSER_ROLE should not set PAUSER_ROLE role", async function () {
      await deployment.connect(owner).unpause();

      let PAUSER_ROLE = await deployment.PAUSER_ROLE();

      await deployment.connect(owner).grantRole(PAUSER_ROLE, userAddr1.address);
      await expectRevert.unspecified(
        deployment.connect(userAddr1).grantRole(PAUSER_ROLE, userAddr2.address)
      );

      expect(await deployment.hasRole(PAUSER_ROLE, userAddr1.address)).to.equal(
        true
      );
      expect(await deployment.hasRole(PAUSER_ROLE, userAddr2.address)).to.equal(
        false
      );
    });
    it("UPGRADER_ROLE should not set UPGRADER_ROLE role", async function () {
      await deployment.connect(owner).unpause();

      let UPGRADER_ROLE = await deployment.UPGRADER_ROLE();

      await deployment
        .connect(owner)
        .grantRole(UPGRADER_ROLE, userAddr1.address);
      await expectRevert.unspecified(
        deployment
          .connect(userAddr1)
          .grantRole(UPGRADER_ROLE, userAddr2.address)
      );

      expect(
        await deployment.hasRole(UPGRADER_ROLE, userAddr1.address)
      ).to.equal(true);
      expect(
        await deployment.hasRole(UPGRADER_ROLE, userAddr2.address)
      ).to.equal(false);
    });

    it("WHITELISTER_ROLE should not set WHITELISTER_ROLE role", async function () {
      await deployment.connect(owner).unpause();

      let WHITELISTER_ROLE = await deployment.WHITELISTER_ROLE();

      await deployment
        .connect(owner)
        .grantRole(WHITELISTER_ROLE, userAddr1.address);
      await expectRevert.unspecified(
        deployment
          .connect(userAddr1)
          .grantRole(WHITELISTER_ROLE, userAddr2.address)
      );

      expect(
        await deployment.hasRole(WHITELISTER_ROLE, userAddr1.address)
      ).to.equal(true);
      expect(
        await deployment.hasRole(WHITELISTER_ROLE, userAddr2.address)
      ).to.equal(false);
    });

    it("UPGRADER_ROLE should not set WHITELISTER_ROLE role", async function () {
      await deployment.connect(owner).unpause();

      let UPGRADER_ROLE = await deployment.UPGRADER_ROLE();
      let WHITELISTER_ROLE = await deployment.WHITELISTER_ROLE();

      await deployment
        .connect(owner)
        .grantRole(UPGRADER_ROLE, userAddr1.address);
      await expectRevert.unspecified(
        deployment
          .connect(userAddr1)
          .grantRole(WHITELISTER_ROLE, userAddr2.address)
      );

      expect(
        await deployment.hasRole(UPGRADER_ROLE, userAddr1.address)
      ).to.equal(true);
      expect(
        await deployment.hasRole(WHITELISTER_ROLE, userAddr2.address)
      ).to.equal(false);
    });
  });

  describe("Owner", function () {
    it("Owner should unpause", async function () {
      await deployment.connect(owner).unpause();
      expect(await deployment.paused()).to.equal(false);
    });

    it("PAUSER_ROLE should unpause", async function () {
      let PAUSER_ROLE = await deployment.PAUSER_ROLE();

      await deployment.connect(owner).grantRole(PAUSER_ROLE, userAddr1.address);
      await deployment.connect(userAddr1).unpause();

      expect(await deployment.paused()).to.equal(false);
    });

    it("Owner should pause", async function () {
      await deployment.connect(owner).unpause();
      await deployment.connect(owner).pause();

      expect(await deployment.paused()).to.equal(true);
    });

    it("PAUSER_ROLE should pause", async function () {
      let PAUSER_ROLE = await deployment.PAUSER_ROLE();

      await deployment.connect(owner).unpause();
      await deployment.connect(owner).grantRole(PAUSER_ROLE, userAddr1.address);
      await deployment.connect(userAddr1).pause();

      expect(await deployment.paused()).to.equal(true);
    });
  });

  describe("Mint", function () {
    it("Only whitelisted should mint", async function () {
      let BOOTSTRAPPER = await deployment.BOOTSTRAPPER();
      let VETERAN = await deployment.VETERAN();
      let ADOPTER = await deployment.ADOPTER();
      let SUSTAINER = await deployment.SUSTAINER();
      let BELIEVER = await deployment.BELIEVER();
      await deployment.connect(owner).unpause();
      await deployment
        .connect(owner)
        .setMerkleRoots(
          "0x299933cac28b9df1ae6dbf7f5d9814b5fe409a67795ed15dea6135b5fe78c6e3",
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000000000000000000000000000"
        );

      deployment
        .connect(userAddr1)
        .mintBootstrapper(tree.getHexProof(keccak256(userAddr1.address)));

      await expectRevert.unspecified(
        deployment
          .connect(userAddr4)
          .mintBootstrapper(tree.getHexProof(keccak256(userAddr4.address)))
      );

      await expectRevert.unspecified(
        deployment
          .connect(userAddr4)
          .mintVeteran(tree.getHexProof(keccak256(userAddr4.address)))
      );
      await expectRevert.unspecified(
        deployment
          .connect(userAddr4)
          .mintAdopter(tree.getHexProof(keccak256(userAddr4.address)))
      );
      await expectRevert.unspecified(
        deployment
          .connect(userAddr4)
          .mintSustainer(tree.getHexProof(keccak256(userAddr4.address)))
      );
      await expectRevert.unspecified(
        deployment
          .connect(userAddr4)
          .mintBeliever(tree.getHexProof(keccak256(userAddr4.address)))
      );

      expect(
        await deployment.balanceOf(userAddr1.address, BOOTSTRAPPER)
      ).to.equal(1);
      expect(
        await deployment.balanceOf(userAddr4.address, VETERAN)
      ).to.equal(0);
      expect(
        await deployment.balanceOf(userAddr4.address, ADOPTER)
      ).to.equal(0);
      expect(
        await deployment.balanceOf(userAddr4.address, SUSTAINER)
      ).to.equal(0);
      expect(
        await deployment.balanceOf(userAddr4.address, BELIEVER)
      ).to.equal(0);
    });

    it("Whitelisted should mint only once", async function () {
      let BOOTSTRAPPER = await deployment.BOOTSTRAPPER();
      let VETERAN = await deployment.VETERAN();
      let ADOPTER = await deployment.ADOPTER();
      let SUSTAINER = await deployment.SUSTAINER();
      let BELIEVER = await deployment.BELIEVER();
      await deployment.connect(owner).unpause();
      await deployment
        .connect(owner)
        .setMerkleRoots(
          "0x299933cac28b9df1ae6dbf7f5d9814b5fe409a67795ed15dea6135b5fe78c6e3",
          "0x299933cac28b9df1ae6dbf7f5d9814b5fe409a67795ed15dea6135b5fe78c6e3",
          "0x299933cac28b9df1ae6dbf7f5d9814b5fe409a67795ed15dea6135b5fe78c6e3",
          "0x299933cac28b9df1ae6dbf7f5d9814b5fe409a67795ed15dea6135b5fe78c6e3",
          "0x299933cac28b9df1ae6dbf7f5d9814b5fe409a67795ed15dea6135b5fe78c6e3"
        );

      await deployment
        .connect(userAddr1)
        .mintBootstrapper(tree.getHexProof(keccak256(userAddr1.address)));        
      await deployment
        .connect(userAddr1)
        .mintVeteran(tree.getHexProof(keccak256(userAddr1.address)));  
      await deployment
        .connect(userAddr1)
        .mintAdopter(tree.getHexProof(keccak256(userAddr1.address)));  
      await deployment
        .connect(userAddr1)
        .mintSustainer(tree.getHexProof(keccak256(userAddr1.address)));  
      await deployment
        .connect(userAddr1)
        .mintBeliever(tree.getHexProof(keccak256(userAddr1.address)));

      await expectRevert.unspecified(
        deployment
          .connect(userAddr1)
          .mintBootstrapper(tree.getHexProof(keccak256(userAddr1.address)))
      );  
      await expectRevert.unspecified(
        deployment
          .connect(userAddr1)
          .mintVeteran(tree.getHexProof(keccak256(userAddr1.address)))
      );  
      await expectRevert.unspecified(
        deployment
          .connect(userAddr1)
          .mintAdopter(tree.getHexProof(keccak256(userAddr1.address)))
      );  
      await expectRevert.unspecified(
        deployment
          .connect(userAddr1)
          .mintSustainer(tree.getHexProof(keccak256(userAddr1.address)))
      );  
      await expectRevert.unspecified(
        deployment
          .connect(userAddr1)
          .mintBeliever(tree.getHexProof(keccak256(userAddr1.address)))
      );

      expect(
        await deployment.balanceOf(userAddr1.address, BOOTSTRAPPER)
      ).to.equal(1);
    });

    it("Should not mint more than supply #1", async function () {
      let BOOTSTRAPPER = await deployment.BOOTSTRAPPER();
      await deployment.connect(owner).unpause();
      await deployment.connect(owner).setSupply(1, 0, 0, 0, 0);

      await deployment
        .connect(owner)
        .setMerkleRoots(
          "0x299933cac28b9df1ae6dbf7f5d9814b5fe409a67795ed15dea6135b5fe78c6e3",
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000000000000000000000000000"
        );

      await deployment
        .connect(userAddr1)
        .mintBootstrapper(tree.getHexProof(keccak256(userAddr1.address)));
      await expectRevert.unspecified(
        deployment
          .connect(userAddr2)
          .mintBootstrapper(tree.getHexProof(keccak256(userAddr2.address)))
      );
      expect(
        await deployment.balanceOf(userAddr1.address, BOOTSTRAPPER)
      ).to.equal(1);
      expect(
        await deployment.balanceOf(userAddr2.address, BOOTSTRAPPER)
      ).to.equal(0);
    });

    it("Should not mint more than supply #2", async function () {
      let BOOTSTRAPPER = await deployment.BOOTSTRAPPER();
      await deployment.connect(owner).unpause();
      await deployment.connect(owner).setSupply(2, 0, 0, 0, 0);

      await deployment
        .connect(owner)
        .setMerkleRoots(
          "0x299933cac28b9df1ae6dbf7f5d9814b5fe409a67795ed15dea6135b5fe78c6e3",
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000000000000000000000000000"
        );

      await deployment
        .connect(userAddr1)
        .mintBootstrapper(tree.getHexProof(keccak256(userAddr1.address)));
      await deployment
        .connect(userAddr2)
        .mintBootstrapper(tree.getHexProof(keccak256(userAddr2.address)));
      await expectRevert.unspecified(
        deployment
          .connect(userAddr3)
          .mintBootstrapper(tree.getHexProof(keccak256(userAddr3.address)))
      );
      expect(
        await deployment.balanceOf(userAddr1.address, BOOTSTRAPPER)
      ).to.equal(1);
      expect(
        await deployment.balanceOf(userAddr2.address, BOOTSTRAPPER)
      ).to.equal(1);
      expect(
        await deployment.balanceOf(userAddr3.address, BOOTSTRAPPER)
      ).to.equal(0);
    });

    it("Can not use proof of another leaf", async function () {
      let BOOTSTRAPPER = await deployment.BOOTSTRAPPER();
      await deployment.connect(owner).unpause();

      await deployment
        .connect(owner)
        .setMerkleRoots(
          "0x299933cac28b9df1ae6dbf7f5d9814b5fe409a67795ed15dea6135b5fe78c6e3",
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000000000000000000000000000"
        );

      await expectRevert.unspecified(
        deployment
          .connect(userAddr1)
          .mintBootstrapper(tree.getHexProof(keccak256(userAddr3.address)))
      );
      expect(
        await deployment.balanceOf(userAddr1.address, BOOTSTRAPPER)
      ).to.equal(0);
    });

    it("Should mint all types of NFT", async function () {
      let BOOTSTRAPPER = await deployment.BOOTSTRAPPER();
      let VETERAN = await deployment.VETERAN();
      let ADOPTER = await deployment.ADOPTER();
      let SUSTAINER = await deployment.SUSTAINER();
      let BELIEVER = await deployment.BELIEVER();
      await deployment.connect(owner).unpause();
      await deployment.connect(owner).setSupply(1, 1, 1, 1, 1);

      await deployment
        .connect(owner)
        .setMerkleRoots(
          "0x299933cac28b9df1ae6dbf7f5d9814b5fe409a67795ed15dea6135b5fe78c6e3",
          "0x299933cac28b9df1ae6dbf7f5d9814b5fe409a67795ed15dea6135b5fe78c6e3",
          "0x299933cac28b9df1ae6dbf7f5d9814b5fe409a67795ed15dea6135b5fe78c6e3",
          "0x299933cac28b9df1ae6dbf7f5d9814b5fe409a67795ed15dea6135b5fe78c6e3",
          "0x299933cac28b9df1ae6dbf7f5d9814b5fe409a67795ed15dea6135b5fe78c6e3"
        );

      await deployment
        .connect(userAddr1)
        .mintBootstrapper(tree.getHexProof(keccak256(userAddr1.address)));
      await deployment
        .connect(userAddr1)
        .mintVeteran(tree.getHexProof(keccak256(userAddr1.address)));
      await deployment
        .connect(userAddr1)
        .mintAdopter(tree.getHexProof(keccak256(userAddr1.address)))
      await deployment
        .connect(userAddr1)
        .mintSustainer(tree.getHexProof(keccak256(userAddr1.address)))
      await deployment
        .connect(userAddr1)
        .mintBeliever(tree.getHexProof(keccak256(userAddr1.address)))

      expect(
        await deployment.balanceOf(userAddr1.address, BOOTSTRAPPER)
      ).to.equal(1);
      expect(
        await deployment.balanceOf(userAddr1.address, VETERAN)
      ).to.equal(1);
      expect(
        await deployment.balanceOf(userAddr1.address, ADOPTER)
      ).to.equal(1);
      expect(
        await deployment.balanceOf(userAddr1.address, SUSTAINER)
      ).to.equal(1);
      expect(
        await deployment.balanceOf(userAddr1.address, BELIEVER)
      ).to.equal(1);
    });

    it("All types of NFT should have different supply limit", async function () {
      let BOOTSTRAPPER = await deployment.BOOTSTRAPPER();
      let VETERAN = await deployment.VETERAN();
      let ADOPTER = await deployment.ADOPTER();
      let SUSTAINER = await deployment.SUSTAINER();
      let BELIEVER = await deployment.BELIEVER();
      await deployment.connect(owner).unpause();
      await deployment.connect(owner).setSupply(2, 1, 2, 1, 2);

      await deployment
        .connect(owner)
        .setMerkleRoots(
          "0x299933cac28b9df1ae6dbf7f5d9814b5fe409a67795ed15dea6135b5fe78c6e3",
          "0x299933cac28b9df1ae6dbf7f5d9814b5fe409a67795ed15dea6135b5fe78c6e3",
          "0x299933cac28b9df1ae6dbf7f5d9814b5fe409a67795ed15dea6135b5fe78c6e3",
          "0x299933cac28b9df1ae6dbf7f5d9814b5fe409a67795ed15dea6135b5fe78c6e3",
          "0x299933cac28b9df1ae6dbf7f5d9814b5fe409a67795ed15dea6135b5fe78c6e3"
        );

      await deployment
        .connect(userAddr1)
        .mintBootstrapper(tree.getHexProof(keccak256(userAddr1.address)));
      await deployment
        .connect(userAddr2)
        .mintBootstrapper(tree.getHexProof(keccak256(userAddr2.address)));
      await expectRevert.unspecified(
        deployment
          .connect(userAddr3)
          .mintBootstrapper(tree.getHexProof(keccak256(userAddr3.address)))
      );

      await deployment
        .connect(userAddr1)
        .mintVeteran(tree.getHexProof(keccak256(userAddr1.address)));
      await expectRevert.unspecified( 
        deployment
          .connect(userAddr2)
          .mintVeteran(tree.getHexProof(keccak256(userAddr2.address)))
      );

      await deployment
        .connect(userAddr1)
        .mintAdopter(tree.getHexProof(keccak256(userAddr1.address)));
      await deployment
        .connect(userAddr2)
        .mintAdopter(tree.getHexProof(keccak256(userAddr2.address)));
      await expectRevert.unspecified(
        deployment
          .connect(userAddr3)
          .mintAdopter(tree.getHexProof(keccak256(userAddr3.address)))
      );

      await deployment
        .connect(userAddr1)
        .mintSustainer(tree.getHexProof(keccak256(userAddr1.address)));
      await expectRevert.unspecified( 
        deployment
          .connect(userAddr2)
          .mintSustainer(tree.getHexProof(keccak256(userAddr2.address)))
      );

      await deployment
        .connect(userAddr1)
        .mintBeliever(tree.getHexProof(keccak256(userAddr1.address)));
      await deployment
        .connect(userAddr2)
        .mintBeliever(tree.getHexProof(keccak256(userAddr2.address)));
      await expectRevert.unspecified(
        deployment
          .connect(userAddr3)
          .mintBeliever(tree.getHexProof(keccak256(userAddr3.address)))
      );

      expect(
        await deployment.balanceOf(userAddr1.address, BOOTSTRAPPER)
      ).to.equal(1);
      expect(
        await deployment.balanceOf(userAddr1.address, VETERAN)
      ).to.equal(1);
      expect(
        await deployment.balanceOf(userAddr1.address, ADOPTER)
      ).to.equal(1);
      expect(
        await deployment.balanceOf(userAddr1.address, SUSTAINER)
      ).to.equal(1);
      expect(
        await deployment.balanceOf(userAddr1.address, BELIEVER)
      ).to.equal(1);

      expect(
        await deployment.balanceOf(userAddr2.address, BOOTSTRAPPER)
      ).to.equal(1);
      expect(
        await deployment.balanceOf(userAddr2.address, VETERAN)
      ).to.equal(0);
      expect(
        await deployment.balanceOf(userAddr2.address, ADOPTER)
      ).to.equal(1);
      expect(
        await deployment.balanceOf(userAddr2.address, SUSTAINER)
      ).to.equal(0);
      expect(
        await deployment.balanceOf(userAddr2.address, BELIEVER)
      ).to.equal(1);

      expect(
        await deployment.balanceOf(userAddr3.address, BOOTSTRAPPER)
      ).to.equal(0);
      expect(
        await deployment.balanceOf(userAddr3.address, VETERAN)
      ).to.equal(0);
      expect(
        await deployment.balanceOf(userAddr3.address, ADOPTER)
      ).to.equal(0);
      expect(
        await deployment.balanceOf(userAddr3.address, SUSTAINER)
      ).to.equal(0);
      expect(
        await deployment.balanceOf(userAddr3.address, BELIEVER)
      ).to.equal(0);
    });

    it("ADMIN should be able to change supply", async function () {
      let BOOTSTRAPPER = await deployment.BOOTSTRAPPER();
      let VETERAN = await deployment.VETERAN();
      await deployment.connect(owner).unpause();
      await deployment.connect(owner).setSupply(1, 0, 0, 0, 0);

      await deployment
        .connect(owner)
        .setMerkleRoots(
          "0x299933cac28b9df1ae6dbf7f5d9814b5fe409a67795ed15dea6135b5fe78c6e3",
          "0x299933cac28b9df1ae6dbf7f5d9814b5fe409a67795ed15dea6135b5fe78c6e3",
          "0x299933cac28b9df1ae6dbf7f5d9814b5fe409a67795ed15dea6135b5fe78c6e3",
          "0x299933cac28b9df1ae6dbf7f5d9814b5fe409a67795ed15dea6135b5fe78c6e3",
          "0x299933cac28b9df1ae6dbf7f5d9814b5fe409a67795ed15dea6135b5fe78c6e3"
        );

      await deployment
        .connect(userAddr1)
        .mintBootstrapper(tree.getHexProof(keccak256(userAddr1.address)));
      await expectRevert.unspecified(
        deployment
          .connect(userAddr2)
          .mintBootstrapper(tree.getHexProof(keccak256(userAddr2.address)))
      );
      await expectRevert.unspecified(
        deployment
          .connect(userAddr3)
          .mintBootstrapper(tree.getHexProof(keccak256(userAddr3.address)))
      );

      expect(
        await deployment.balanceOf(userAddr1.address, BOOTSTRAPPER)
      ).to.equal(1);
      expect(
        await deployment.balanceOf(userAddr2.address, BOOTSTRAPPER)
      ).to.equal(0);
      expect(
        await deployment.balanceOf(userAddr3.address, BOOTSTRAPPER)
      ).to.equal(0);

      await deployment.connect(owner).setSupply(2, 1, 1, 1, 1);
      
      await deployment
        .connect(userAddr2)
        .mintBootstrapper(tree.getHexProof(keccak256(userAddr2.address)));

      await deployment
        .connect(userAddr1)
        .mintVeteran(tree.getHexProof(keccak256(userAddr1.address)));
      await expectRevert.unspecified(
        deployment
          .connect(userAddr2)
          .mintVeteran(tree.getHexProof(keccak256(userAddr2.address)))
      );

      expect(
        await deployment.balanceOf(userAddr1.address, BOOTSTRAPPER)
      ).to.equal(1);
      expect(
        await deployment.balanceOf(userAddr2.address, BOOTSTRAPPER)
      ).to.equal(1);
      expect(
        await deployment.balanceOf(userAddr3.address, BOOTSTRAPPER)
      ).to.equal(0);

      expect(
        await deployment.balanceOf(userAddr1.address, VETERAN)
      ).to.equal(1);
      expect(
        await deployment.balanceOf(userAddr2.address, VETERAN)
      ).to.equal(0);
    });
  });

  describe("Transactions", function () {
    it("User should not be able to transfer", async function () {
      let BOOTSTRAPPER = await deployment.BOOTSTRAPPER();
      await deployment.connect(owner).unpause();
      
      await deployment
        .connect(owner)
        .setMerkleRoots(
          "0x299933cac28b9df1ae6dbf7f5d9814b5fe409a67795ed15dea6135b5fe78c6e3",
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000000000000000000000000000"
        );

      await deployment
        .connect(userAddr1)
        .mintBootstrapper(tree.getHexProof(keccak256(userAddr1.address)));

      await expectRevert.unspecified(
        deployment
          .connect(userAddr1)
          .safeTransferFrom(
            userAddr1.address,
            userAddr2.address,
            BOOTSTRAPPER,
            1,
            0
          )
      );

      expect(
        await deployment.balanceOf(userAddr1.address, BOOTSTRAPPER)
      ).to.equal(1);
      expect(
        await deployment.balanceOf(userAddr2.address, BOOTSTRAPPER)
      ).to.equal(0);
    });

    it("Admin should be able to transfer with user allowance", async function () {
      let BOOTSTRAPPER = await deployment.BOOTSTRAPPER();
      await deployment.connect(owner).unpause();
      
      await deployment
        .connect(owner)
        .setMerkleRoots(
          "0x299933cac28b9df1ae6dbf7f5d9814b5fe409a67795ed15dea6135b5fe78c6e3",
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000000000000000000000000000"
        );

      await deployment
        .connect(userAddr1)
        .mintBootstrapper(tree.getHexProof(keccak256(userAddr1.address)));

      await deployment
        .connect(userAddr1)
        .setApprovalForAll(owner.address, true);
      await deployment
        .connect(owner)
        .safeTransferFrom(
          userAddr1.address,
          userAddr2.address,
          BOOTSTRAPPER,
          1,
          0
        );

      expect(
        await deployment.balanceOf(userAddr1.address, BOOTSTRAPPER)
      ).to.equal(0);
      expect(
        await deployment.balanceOf(userAddr2.address, BOOTSTRAPPER)
      ).to.equal(1);
    });

    it("Admin should be not able to transfer without user allowance", async function () {
      let BOOTSTRAPPER = await deployment.BOOTSTRAPPER();
      await deployment.connect(owner).unpause();
      
      await deployment
        .connect(owner)
        .setMerkleRoots(
          "0x299933cac28b9df1ae6dbf7f5d9814b5fe409a67795ed15dea6135b5fe78c6e3",
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000000000000000000000000000"
        );

      await deployment
        .connect(userAddr1)
        .mintBootstrapper(tree.getHexProof(keccak256(userAddr1.address)));

      await expectRevert.unspecified(
        deployment
          .connect(owner)
          .safeTransferFrom(
            userAddr1.address,
            userAddr2.address,
            BOOTSTRAPPER,
            1,
            0
          )
      );

      expect(
        await deployment.balanceOf(userAddr1.address, BOOTSTRAPPER)
      ).to.equal(1);
      expect(
        await deployment.balanceOf(userAddr2.address, BOOTSTRAPPER)
      ).to.equal(0);
    });
  });

  describe("Art", function () {
    it("Should have URI", async function () {
      await deployment.connect(owner).unpause();

      expect(await deployment.uri(1)).to.equal(
        "https://stakeborgdao.xyz/api/badge/seniority/{id}.json"
      );
    });

    it("Admin should be able to change uri", async function () {
      await deployment.connect(owner).unpause();
      await deployment.connect(owner).setURI("https://stakeborgdao.xyz/api/badge/seniority2/{id}.json");

      expect(await deployment.uri(1)).to.equal(
        "https://stakeborgdao.xyz/api/badge/seniority2/{id}.json"
      );
    });

    it("User should not be able to change uri", async function () {
      await deployment.connect(owner).unpause();
      await expectRevert.unspecified(
        deployment.connect(userAddr1).setURI("https://stakeborgdao.xyz/api/badge/seniority2/{id}.json")
      );

      expect(await deployment.uri(1)).to.equal(
        "https://stakeborgdao.xyz/api/badge/seniority/{id}.json"
      );
    });
  });
});

describe("Seniority Badge Upgrade", function () {
  describe("Deployment", function () {
    xit("Should upgrade", async function () {
      const contract = await ethers.getContractFactory("SeniorityBadge");
      const deployment = await upgrades.deployProxy(contract);

      await deployment.deployed();

      const contractV2 = await ethers.getContractFactory("SeniorityBadgeV2");
      const deploymentV2 = await upgrades.upgradeProxy(
        deployment.address,
        contractV2
      );

      await deploymentV2.deployed();
    });

    xit("Upgrade should have new tokenid", async function () {
      const contract = await ethers.getContractFactory("SeniorityBadge");
      const deployment = await upgrades.deployProxy(contract);

      await deployment.deployed();

      const contractV2 = await ethers.getContractFactory("SeniorityBadgeV2");
      const deploymentV2 = await upgrades.upgradeProxy(
        deployment.address,
        contractV2
      );

      await deploymentV2.deployed();
      await deploymentV2.upgradeToV2();

      expect(await deploymentV2.BOOTSTRAPPER()).to.equal(0);
      expect(await deploymentV2.BOOTSTRAPPER_SUPPLY()).to.equal(50);

      expect(await deploymentV2.TEST()).to.equal(5);
      expect(await deploymentV2.TEST_SUPPLY()).to.equal(1);
    });

    xit("Minted tokens should remain after upgrade", async function () {
      let owner;
      let userAddr1;
      let userAddr2;

      [owner, userAddr1, userAddr2] = await ethers.getSigners();
      const contract = await ethers.getContractFactory("SeniorityBadge");
      const deployment = await upgrades.deployProxy(contract);

      await deployment.connect(owner).unpause();

      let MINTER_BOOTSTRAPPER_ROLE =
        await deployment.MINTER_BOOTSTRAPPER_ROLE();
      let BOOTSTRAPPER = await deployment.BOOTSTRAPPER();

      await deployment.deployed();

      await deployment
        .connect(owner)
        .grantRole(MINTER_BOOTSTRAPPER_ROLE, userAddr1.address);

      await deployment.connect(userAddr1).mint();

      const contractV2 = await ethers.getContractFactory("SeniorityBadgeV2");
      const deploymentV2 = await upgrades.upgradeProxy(
        deployment.address,
        contractV2
      );

      await deploymentV2.deployed();
      await deploymentV2.upgradeToV2();

      expect(
        await deploymentV2.balanceOf(userAddr1.address, BOOTSTRAPPER)
      ).to.equal(1);

      await deploymentV2.connect(userAddr1).mint();

      expect(
        await deploymentV2.balanceOf(userAddr1.address, BOOTSTRAPPER)
      ).to.equal(1);
    });

    xit("Admin should be able to transfer TEST token on upgraded contract with allowance", async function () {
      let owner;
      let userAddr1;
      let userAddr2;

      [owner, userAddr1, userAddr2] = await ethers.getSigners();
      const contract = await ethers.getContractFactory("SeniorityBadge");
      const deployment = await upgrades.deployProxy(contract);

      await deployment.deployed();

      const contractV2 = await ethers.getContractFactory("SeniorityBadgeV2");
      const deploymentV2 = await upgrades.upgradeProxy(
        deployment.address,
        contractV2
      );

      await deploymentV2.deployed();
      await deploymentV2.upgradeToV2();

      await deploymentV2.connect(owner).unpause();

      let MINTER_TEST_ROLE = await deploymentV2.MINTER_TEST_ROLE();
      let TEST = await deploymentV2.TEST();

      await deploymentV2
        .connect(owner)
        .grantRole(MINTER_TEST_ROLE, userAddr1.address);

      await deploymentV2.connect(userAddr1).mint();
      await deploymentV2
        .connect(userAddr1)
        .setApprovalForAll(owner.address, true);

      await deploymentV2
        .connect(owner)
        .safeTransferFrom(userAddr1.address, userAddr2.address, TEST, 1, 0);

      expect(await deploymentV2.balanceOf(userAddr1.address, TEST)).to.equal(0);
      expect(await deploymentV2.balanceOf(userAddr2.address, TEST)).to.equal(1);
    });

    xit("Admin should be able to transfer BOOTSTRAPPER token on upgraded contract with allowance after upgrade", async function () {
      let owner;
      let userAddr1;
      let userAddr2;

      [owner, userAddr1, userAddr2] = await ethers.getSigners();
      const contract = await ethers.getContractFactory("SeniorityBadge");
      const deployment = await upgrades.deployProxy(contract);

      await deployment.connect(owner).unpause();

      let MINTER_BOOTSTRAPPER_ROLE =
        await deployment.MINTER_BOOTSTRAPPER_ROLE();
      let BOOTSTRAPPER = await deployment.BOOTSTRAPPER();

      await deployment.deployed();

      await deployment
        .connect(owner)
        .grantRole(MINTER_BOOTSTRAPPER_ROLE, userAddr1.address);

      await deployment.connect(userAddr1).mint();

      const contractV2 = await ethers.getContractFactory("SeniorityBadgeV2");
      const deploymentV2 = await upgrades.upgradeProxy(
        deployment.address,
        contractV2
      );

      await deploymentV2.deployed();
      await deploymentV2.upgradeToV2();

      await deploymentV2
        .connect(userAddr1)
        .setApprovalForAll(owner.address, true);

      await deploymentV2
        .connect(owner)
        .safeTransferFrom(
          userAddr1.address,
          userAddr2.address,
          BOOTSTRAPPER,
          1,
          0
        );

      expect(
        await deploymentV2.balanceOf(userAddr1.address, BOOTSTRAPPER)
      ).to.equal(0);
      expect(
        await deploymentV2.balanceOf(userAddr2.address, BOOTSTRAPPER)
      ).to.equal(1);
    });
  });
});
