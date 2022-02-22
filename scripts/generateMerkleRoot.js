const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");
const whitelistAddresses = require("./../data/test_whitelist.json");

const leaves = whitelistAddresses.map((addr) => keccak256(addr));
const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });

const root = tree.getHexRoot();

console.log(`Whitelisted addresses: ${whitelistAddresses}`);
console.log(`Merkle Root : ${root}`);
