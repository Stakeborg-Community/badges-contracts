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
  let userAddr3;
  let userAddrs;

  beforeEach(async function () {
    contract = await ethers.getContractFactory("SeniorityBadge");
    deployment = await contract.deploy();
    [owner, userAddr1, userAddr2, userAddr3, ...userAddrs] =
      await ethers.getSigners();
  });

  describe("Deployment", function () {});

  describe("Roles", function () {});

  describe("Whitelist", function () {});

  describe("Mint", function () {});

  describe("Transactions", function () {});

  describe("Art", function () {});
});
