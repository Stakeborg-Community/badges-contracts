const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
const {
  expectRevert, // Assertions for transactions that should fail
} = require("@openzeppelin/test-helpers");
const { BigNumber } = require("ethers");

describe("Seniority Badge Contract", function () {
  let contract, deployment;

  let owner;
  let userAddr1;
  let userAddr2;
  let userAddr3;
  let userAddrs;

  beforeEach(async function () {
    contract = await ethers.getContractFactory("SeniorityBadge");
    deployment = await upgrades.deployProxy(contract);

    await deployment.deployed();

    [owner, userAddr1, userAddr2, userAddr3, ...userAddrs] =
      await ethers.getSigners();
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

      let MINTER_BOOTSTRAPPER_ROLE =
        await deployment.MINTER_BOOTSTRAPPER_ROLE();

      await deployment
        .connect(owner)
        .grantRole(MINTER_BOOTSTRAPPER_ROLE, owner.address);
      await deployment.mint();

      expect(await deployment.uri(0)).to.equal(
        "https://stakeborgdao.xyz/api/badge/seniority/{id}.json"
      );
    });
  });

  describe("Roles", function () {
    it("Owner should set ADMIN role", async function () {
      await deployment.connect(owner).unpause();

      let MINTER_ADMIN_ROLE = await deployment.MINTER_ADMIN_ROLE();

      await deployment
        .connect(owner)
        .grantRole(MINTER_ADMIN_ROLE, userAddr1.address);

      expect(
        await deployment.hasRole(MINTER_ADMIN_ROLE, userAddr1.address)
      ).to.equal(true);
    });

    it("ADMIN should not set ADMIN role", async function () {
      await deployment.connect(owner).unpause();

      let MINTER_ADMIN_ROLE = await deployment.MINTER_ADMIN_ROLE();

      await deployment
        .connect(owner)
        .grantRole(MINTER_ADMIN_ROLE, userAddr1.address);
      await expectRevert.unspecified(
        deployment
          .connect(userAddr1)
          .grantRole(MINTER_ADMIN_ROLE, userAddr2.address)
      );

      expect(
        await deployment.hasRole(MINTER_ADMIN_ROLE, userAddr1.address)
      ).to.equal(true);
      expect(
        await deployment.hasRole(MINTER_ADMIN_ROLE, userAddr2.address)
      ).to.equal(false);
    });

    it("ADMIN should set MINTER_BOOTSTRAPPER_ROLE role", async function () {
      await deployment.connect(owner).unpause();

      let MINTER_ADMIN_ROLE = await deployment.MINTER_ADMIN_ROLE();
      let MINTER_BOOTSTRAPPER_ROLE =
        await deployment.MINTER_BOOTSTRAPPER_ROLE();

      await deployment
        .connect(owner)
        .grantRole(MINTER_ADMIN_ROLE, userAddr1.address);
      await deployment
        .connect(userAddr1)
        .grantRole(MINTER_BOOTSTRAPPER_ROLE, userAddr2.address);

      expect(
        await deployment.hasRole(MINTER_ADMIN_ROLE, userAddr1.address)
      ).to.equal(true);
      expect(
        await deployment.hasRole(MINTER_BOOTSTRAPPER_ROLE, userAddr2.address)
      ).to.equal(true);
    });

    it("MINTER_BOOTSTRAPPER_ROLE should not set MINTER_BOOTSTRAPPER_ROLE role", async function () {
      await deployment.connect(owner).unpause();

      let MINTER_BOOTSTRAPPER_ROLE =
        await deployment.MINTER_BOOTSTRAPPER_ROLE();

      await deployment
        .connect(owner)
        .grantRole(MINTER_BOOTSTRAPPER_ROLE, userAddr1.address);

      await expectRevert.unspecified(
        deployment
          .connect(userAddr1)
          .grantRole(MINTER_BOOTSTRAPPER_ROLE, userAddr2.address)
      );

      expect(
        await deployment.hasRole(MINTER_BOOTSTRAPPER_ROLE, userAddr1.address)
      ).to.equal(true);
      expect(
        await deployment.hasRole(MINTER_BOOTSTRAPPER_ROLE, userAddr2.address)
      ).to.equal(false);
    });
  });

  describe("Owner", function () {
    it("Owner should unpause", async function () {
      await deployment.connect(owner).unpause();
      expect(await deployment.paused()).to.equal(false);
    });

    it("ADMIN should not unpause", async function () {
      let MINTER_ADMIN_ROLE = await deployment.MINTER_ADMIN_ROLE();

      await deployment
        .connect(owner)
        .grantRole(MINTER_ADMIN_ROLE, userAddr1.address);

      await expectRevert.unspecified(deployment.connect(userAddr1).unpause());
      expect(await deployment.paused()).to.equal(true);
    });

    it("Owner should pause", async function () {
      await deployment.connect(owner).unpause();
      await deployment.connect(owner).pause();
      expect(await deployment.paused()).to.equal(true);
    });

    it("ADMIN should not pause", async function () {
      await deployment.connect(owner).unpause();

      let MINTER_ADMIN_ROLE = await deployment.MINTER_ADMIN_ROLE();

      await deployment
        .connect(owner)
        .grantRole(MINTER_ADMIN_ROLE, userAddr1.address);

      await expectRevert.unspecified(deployment.connect(userAddr1).pause());
      expect(await deployment.paused()).to.equal(false);
    });
  });

  describe("Mint", function () {
    it("Should not mint more than supply #1", async function () {
      await deployment.connect(owner).unpause();
      await deployment.connect(owner).setBootstrapperSupply(1);

      let MINTER_BOOTSTRAPPER_ROLE =
        await deployment.MINTER_BOOTSTRAPPER_ROLE();
      let BOOTSTRAPPER = await deployment.BOOTSTRAPPER();

      await deployment
        .connect(owner)
        .grantRole(MINTER_BOOTSTRAPPER_ROLE, userAddr1.address);
      await deployment
        .connect(owner)
        .grantRole(MINTER_BOOTSTRAPPER_ROLE, userAddr2.address);

      await deployment.connect(userAddr1).mint();
      await expectRevert.unspecified(deployment.connect(userAddr2).mint());

      expect(
        await deployment.balanceOf(userAddr1.address, BOOTSTRAPPER)
      ).to.equal(1);

      expect(
        await deployment.balanceOf(userAddr2.address, BOOTSTRAPPER)
      ).to.equal(0);
    });

    it("Should not mint more than supply #2", async function () {
      await deployment.connect(owner).unpause();
      await deployment.connect(owner).setBootstrapperSupply(2);

      let MINTER_BOOTSTRAPPER_ROLE =
        await deployment.MINTER_BOOTSTRAPPER_ROLE();
      let BOOTSTRAPPER = await deployment.BOOTSTRAPPER();

      await deployment
        .connect(owner)
        .grantRole(MINTER_BOOTSTRAPPER_ROLE, userAddr1.address);
      await deployment
        .connect(owner)
        .grantRole(MINTER_BOOTSTRAPPER_ROLE, userAddr2.address);
      await deployment
        .connect(owner)
        .grantRole(MINTER_BOOTSTRAPPER_ROLE, userAddr3.address);

      await deployment.connect(userAddr1).mint();
      await deployment.connect(userAddr2).mint();
      await expectRevert.unspecified(deployment.connect(userAddr3).mint());

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
  });

  describe("Transactions", function () {
    it("User should not be able to transfer", async function () {
      await deployment.connect(owner).unpause();

      let MINTER_BOOTSTRAPPER_ROLE =
        await deployment.MINTER_BOOTSTRAPPER_ROLE();
      let BOOTSTRAPPER = await deployment.BOOTSTRAPPER();

      await deployment
        .connect(owner)
        .grantRole(MINTER_BOOTSTRAPPER_ROLE, userAddr1.address);
      await deployment
        .connect(owner)
        .grantRole(MINTER_BOOTSTRAPPER_ROLE, userAddr2.address);

      await deployment.connect(userAddr1).mint();
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
      await deployment.connect(owner).unpause();

      let MINTER_BOOTSTRAPPER_ROLE =
        await deployment.MINTER_BOOTSTRAPPER_ROLE();
      let BOOTSTRAPPER = await deployment.BOOTSTRAPPER();

      await deployment
        .connect(owner)
        .grantRole(MINTER_BOOTSTRAPPER_ROLE, userAddr1.address);

      await deployment.connect(userAddr1).mint();
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
      await deployment.connect(owner).unpause();

      let MINTER_BOOTSTRAPPER_ROLE =
        await deployment.MINTER_BOOTSTRAPPER_ROLE();
      let BOOTSTRAPPER = await deployment.BOOTSTRAPPER();

      await deployment
        .connect(owner)
        .grantRole(MINTER_BOOTSTRAPPER_ROLE, userAddr1.address);

      await deployment.connect(userAddr1).mint();

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

  describe("Art", function () {});
});
