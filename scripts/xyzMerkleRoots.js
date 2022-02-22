const axios = require("axios");
var ethers = require("ethers");
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");
require("dotenv").config();

const usersAlreadyWhitelisted = require("../data/users_already_whitelisted.json");

const addressAreadyWhiteslited1 = require("../data/address_already_whitelisted_1.json");
const addressAreadyWhiteslited2 = require("../data/address_already_whitelisted_2.json");
const addressAreadyWhiteslited3 = require("../data/address_already_whitelisted_3.json");
const addressAreadyWhiteslited4 = require("../data/address_already_whitelisted_4.json");

let provider = new ethers.providers.InfuraProvider(
  "homestead",
  process.env.INFURA_PROJECT_ID
);
var basicAuth =
  "Basic " + btoa(process.env.XYZ_API_USER + ":" + process.env.XYZ_API_KEY);

let usersList = [];

function getAlreadyWhitelistedAddresses(type) {
  switch (type) {
    case 100:
      return addressAreadyWhiteslited1;
    case 250:
      return addressAreadyWhiteslited2;
    case 500:
      return addressAreadyWhiteslited3;
    case 1000:
      return addressAreadyWhiteslited4;
    default:
      break;
  }
}

async function getAddresses(type) {
  let addressList = getAlreadyWhitelistedAddresses(type);
  await axios
    .get(`https://stakeborgdao.xyz/wp-json/badges/v1/users?type=${type}`, {
      headers: { Authorization: basicAuth },
    })
    .then(
      async (response) => {
        let data = response.data;

        Object.keys(data).forEach(async (entry) => {
          let entryErc20 = data[entry]["erc20"];
          let entryUsername = data[entry]["username"];
          if (
            entryErc20.length > 0 &&
            ethers.utils.isAddress(entryErc20) &&
            !usersAlreadyWhitelisted.includes(entryUsername) &&
            !addressList.includes(entryErc20)
          ) {
            var entryAddress = await provider.resolveName(entryErc20);
            addressList.push(entryAddress);
            usersList.push(entryUsername);
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
      1: JSON.stringify(type100Addresses),
      2: JSON.stringify(type250Addresses),
      3: JSON.stringify(type500Addresses),
      4: JSON.stringify(type1000Addresses),
    },
    merkleRoot: {
      1: type100root,
      2: type250root,
      3: type500root,
      4: type1000root,
    },
  };

  console.log(usefulObj);
  console.log(`Old users list: ${JSON.stringify(usersAlreadyWhitelisted)}`);
  console.log(`New users list: ${JSON.stringify(usersList)}`);
}

main();
