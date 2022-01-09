const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  BN, // Big Number support
  constants, // Common constants, like the zero address and largest integers
  expectEvent, // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
} = require("@openzeppelin/test-helpers");
const { BigNumber } = require("ethers");

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

    it("Others should not be able to unpause", async function () {
      await expectRevert.unspecified(deployment.connect(userAddr1).unpause());
      expect(await deployment.paused()).to.equal(true);
    });

    it("Owner should be able to unpause", async function () {
      await deployment.connect(owner).unpause();
      expect(await deployment.paused()).to.equal(false);
    });

    it("Others should not be able to pause", async function () {
      await deployment.connect(owner).unpause();
      await expectRevert.unspecified(deployment.connect(userAddr1).pause());
      expect(await deployment.paused()).to.equal(false);
    });

    it("Owner should be able to pause", async function () {
      await deployment.connect(owner).unpause();
      await deployment.connect(owner).pause();
      expect(await deployment.paused()).to.equal(true);
    });
  });

  describe("Roles", function () {
    it("Should have owner as DEFAULT ADMIN", async function () {
      let admin_role = await deployment.DEFAULT_ADMIN_ROLE();
      expect(await deployment.hasRole(admin_role, owner.address)).to.equal(
        true
      );
    });

    it("Should have owner as MINTER ADMIN", async function () {
      let minter_admin_role = await deployment.MINTER_ADMIN_ROLE();
      expect(
        await deployment.hasRole(minter_admin_role, owner.address)
      ).to.equal(true);
    });

    it("Should have owner as MINTER", async function () {
      let minter_role = await deployment.MINTER_ROLE();
      expect(await deployment.hasRole(minter_role, owner.address)).to.equal(
        true
      );
    });

    it("Others should not have DEFAULT ADMIN", async function () {
      let admin_role = await deployment.DEFAULT_ADMIN_ROLE();
      expect(await deployment.hasRole(admin_role, userAddr1.address)).to.equal(
        false
      );
    });

    it("Others should not have MINTER ADMIN", async function () {
      let minter_admin_role = await deployment.MINTER_ADMIN_ROLE();
      expect(
        await deployment.hasRole(minter_admin_role, userAddr1.address)
      ).to.equal(false);
    });

    it("Owner should be able to set MINTER ADMIN", async function () {
      let minter_admin_role = await deployment.MINTER_ADMIN_ROLE();
      await deployment
        .connect(owner)
        .grantRole(minter_admin_role, userAddr1.address);
      expect(
        await deployment.hasRole(minter_admin_role, userAddr1.address)
      ).to.equal(true);
    });

    it("MINTER ADMIN should not have DEFAULT ADMIN", async function () {
      let minter_admin_role = await deployment.MINTER_ADMIN_ROLE();
      let admin_role = await deployment.DEFAULT_ADMIN_ROLE();
      await deployment
        .connect(owner)
        .grantRole(minter_admin_role, userAddr1.address);
      expect(
        await deployment.hasRole(minter_admin_role, userAddr1.address)
      ).to.equal(true);
      expect(await deployment.hasRole(admin_role, userAddr1.address)).to.equal(
        false
      );
    });

    it("MINTER ADMIN should not be able to set MINTER ADMIN", async function () {
      let minter_admin_role = await deployment.MINTER_ADMIN_ROLE();
      await deployment
        .connect(owner)
        .grantRole(minter_admin_role, userAddr1.address);

      await expectRevert.unspecified(
        deployment
          .connect(userAddr1)
          .grantRole(minter_admin_role, userAddr2.address)
      );

      expect(
        await deployment.hasRole(minter_admin_role, userAddr2.address)
      ).to.equal(false);
    });
  });
  describe("Whitelist", function () {
    it("Owner should be able to set MINTER", async function () {
      let minter_role = await deployment.MINTER_ROLE();
      let minter_admin_role = await deployment.MINTER_ADMIN_ROLE();
      await deployment.connect(owner).grantRole(minter_role, userAddr1.address);
      expect(await deployment.hasRole(minter_role, userAddr1.address)).to.equal(
        true
      );
      expect(
        await deployment.hasRole(minter_admin_role, userAddr1.address)
      ).to.equal(false);
    });

    it("MINTER ADMIN should be able to set MINTER", async function () {
      let minter_role = await deployment.MINTER_ROLE();
      let minter_admin_role = await deployment.MINTER_ADMIN_ROLE();

      await deployment
        .connect(owner)
        .grantRole(minter_admin_role, userAddr1.address);

      expect(
        await deployment.hasRole(minter_admin_role, userAddr1.address)
      ).to.equal(true);
      expect(await deployment.hasRole(minter_role, userAddr1.address)).to.equal(
        false
      );
      expect(
        await deployment.hasRole(minter_admin_role, userAddr2.address)
      ).to.equal(false);
      expect(await deployment.hasRole(minter_role, userAddr2.address)).to.equal(
        false
      );

      await deployment
        .connect(userAddr1)
        .grantRole(minter_role, userAddr2.address);

      expect(
        await deployment.hasRole(minter_admin_role, userAddr2.address)
      ).to.equal(false);
      expect(await deployment.hasRole(minter_role, userAddr2.address)).to.equal(
        true
      );
    });
  });
  describe("Mint", function () {
    it("Owner should be able to mint when not paused", async function () {
      await deployment.connect(owner).unpause();
      await deployment.connect(owner).safeMint(owner.address);

      expect(await deployment.balanceOf(owner.address)).to.eql(
        BigNumber.from(1)
      );
    });

    it("Others should not be able to mint when not paused", async function () {
      await deployment.connect(owner).unpause();

      await expectRevert.unspecified(
        deployment.connect(userAddr1).safeMint(userAddr1.address)
      );

      expect(await deployment.balanceOf(userAddr1.address)).to.eql(
        BigNumber.from(0)
      );
    });

    it("ADMIN MINT should not be able to mint when not paused", async function () {
      await deployment.connect(owner).unpause();

      let minter_admin_role = await deployment.MINTER_ADMIN_ROLE();
      await deployment
        .connect(owner)
        .grantRole(minter_admin_role, userAddr1.address);

      await expectRevert.unspecified(
        deployment.connect(userAddr1).safeMint(userAddr1.address)
      );

      expect(await deployment.balanceOf(userAddr1.address)).to.eql(
        BigNumber.from(0)
      );
    });

    it("MINTER role should be able to mint when not paused", async function () {
      await deployment.connect(owner).unpause();

      let minter_role = await deployment.MINTER_ROLE();
      await deployment.connect(owner).grantRole(minter_role, userAddr1.address);

      await deployment.connect(userAddr1).safeMint(userAddr1.address);

      expect(await deployment.balanceOf(userAddr1.address)).to.eql(
        BigNumber.from(1)
      );
    });

    it("MINTER role should not be able to mint when paused", async function () {
      await deployment.connect(owner).unpause();

      let minter_role = await deployment.MINTER_ROLE();
      await deployment.connect(owner).grantRole(minter_role, userAddr1.address);

      await deployment.connect(owner).pause();

      await expectRevert.unspecified(
        deployment.connect(userAddr1).safeMint(userAddr1.address)
      );

      expect(await deployment.balanceOf(userAddr1.address)).to.eql(
        BigNumber.from(0)
      );
    });
  });
  describe("Transactions", function () {
    it("MINTER role should not be able to transfer", async function () {
      await deployment.connect(owner).unpause();

      let minter_role = await deployment.MINTER_ROLE();
      await deployment.connect(owner).grantRole(minter_role, userAddr1.address);

      await deployment.connect(userAddr1).safeMint(userAddr1.address);

      await deployment.connect(userAddr1).approve(userAddr2.address, 0);

      await expectRevert.unspecified(
        deployment
          .connect(userAddr1)
          .transferFrom(userAddr1.address, userAddr2.address, 0)
      );

      expect(await deployment.balanceOf(userAddr2.address)).to.eql(
        BigNumber.from(0)
      );
      expect(await deployment.balanceOf(userAddr1.address)).to.eql(
        BigNumber.from(1)
      );
    });

    it("ADMIN MINT role should not be able to transfer", async function () {
      await deployment.connect(owner).unpause();

      let minter_role = await deployment.MINTER_ROLE();
      let minter_admin_role = await deployment.MINTER_ADMIN_ROLE();
      await deployment.connect(owner).grantRole(minter_role, userAddr1.address);
      await deployment
        .connect(owner)
        .grantRole(minter_admin_role, userAddr1.address);

      await deployment.connect(userAddr1).safeMint(userAddr1.address);

      await deployment.connect(userAddr1).approve(userAddr2.address, 0);

      await expectRevert.unspecified(
        deployment
          .connect(userAddr1)
          .transferFrom(userAddr1.address, userAddr2.address, 0)
      );

      expect(await deployment.balanceOf(userAddr2.address)).to.eql(
        BigNumber.from(0)
      );
      expect(await deployment.balanceOf(userAddr1.address)).to.eql(
        BigNumber.from(1)
      );
    });

    it("ADMIN DEFAULT role should be able to transfer with approval", async function () {
      await deployment.connect(owner).unpause();

      let minter_role = await deployment.MINTER_ROLE();

      await deployment.connect(owner).grantRole(minter_role, userAddr1.address);

      await deployment.connect(userAddr1).safeMint(userAddr1.address);

      await deployment.connect(userAddr1).approve(owner.address, 0);

      await deployment
        .connect(owner)
        .transferFrom(userAddr1.address, userAddr2.address, 0);

      expect(await deployment.balanceOf(userAddr2.address)).to.eql(
        BigNumber.from(1)
      );
      expect(await deployment.balanceOf(userAddr1.address)).to.eql(
        BigNumber.from(0)
      );
    });

    it("ADMIN DEFAULT role should not be able to transfer without approval", async function () {
      await deployment.connect(owner).unpause();

      let minter_role = await deployment.MINTER_ROLE();

      await deployment.connect(owner).grantRole(minter_role, userAddr1.address);

      await deployment.connect(userAddr1).safeMint(userAddr1.address);

      await expectRevert.unspecified(
        deployment
          .connect(owner)
          .transferFrom(userAddr1.address, userAddr2.address, 0)
      );

      expect(await deployment.balanceOf(userAddr2.address)).to.eql(
        BigNumber.from(0)
      );
      expect(await deployment.balanceOf(userAddr1.address)).to.eql(
        BigNumber.from(1)
      );
    });
  });
});
