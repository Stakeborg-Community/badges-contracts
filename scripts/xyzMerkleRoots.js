const axios = require("axios");
var ethers = require("ethers");
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");
require("dotenv").config();

let provider = new ethers.providers.InfuraProvider(
  "homestead",
  process.env.INFURA_PROJECT_ID
);
var basicAuth =
  "Basic " + btoa(process.env.XYZ_API_USER + ":" + process.env.XYZ_API_KEY);

async function getAddresses(type) {
  let addressList = [];
  let root;
  await axios
    .get(`https://stakeborgdao.xyz/wp-json/badges/v1/users?type=${type}`, {
      headers: { Authorization: basicAuth },
    })
    .then(
      async (response) => {
        let data = response.data;

        Object.keys(data).forEach(async (entry) => {
          entryErc20 = data[entry]["erc20"];
          if (entryErc20) {
            var entryAddress = await provider.resolveName(entryErc20);
            addressList.push(entryAddress);
          }
        });
      },
      (error) => {
        console.log(error);
      }
    );
  return [addressList];
}

async function main() {
  let type100Addresses = await getAddresses(100);
  console.log("Generate merkleroots");

  console.log("100");
  const type100leaves = type100Addresses.map((addr) => keccak256(addr));
  const type100tree = new MerkleTree(type100leaves, keccak256, {
    sortPairs: true,
  });
  const type100root = type100tree.getHexRoot();

  console.log("250");
  let type250Addresses = await getAddresses(250);

  const type250leaves = type250Addresses.map((addr) => keccak256(addr));
  const type250tree = new MerkleTree(type250leaves, keccak256, {
    sortPairs: true,
  });
  const type250root = type250tree.getHexRoot();

  console.log("500");
  let type500Addresses = await getAddresses(500);

  const type500leaves = type500Addresses.map((addr) => keccak256(addr));
  const type500tree = new MerkleTree(type500leaves, keccak256, {
    sortPairs: true,
  });
  const type500root = type500tree.getHexRoot();

  console.log("1000");
  let type1000Addresses = await getAddresses(1000);

  const type1000leaves = type1000Addresses.map((addr) => keccak256(addr));
  const type1000tree = new MerkleTree(type1000leaves, keccak256, {
    sortPairs: true,
  });
  const type1000root = type1000tree.getHexRoot();

  let usefulObj = new Object();
  usefulObj = {
    tokenId: {
      1: type100Addresses.toString(),
      2: type250Addresses.toString(),
      3: type500Addresses.toString(),
      4: type1000Addresses.toString(),
    },
    merkleRoot: {
      1: type100root,
      2: type250root,
      3: type500root,
      4: type1000root,
    },
  };

  console.log(usefulObj);
}

main();
