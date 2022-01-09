/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-waffle");
require("dotenv").config({ path: __dirname + "/.env" });

console.log(__dirname + "/.env");

const API_KEY = process.env.NODE_APY_KEY;

module.exports = {
  networks: {
    hardhat: {
      // forked mainnet used for testing
      forking: {
        url: `https://polygon-mainnet.g.alchemy.com/v2/${API_KEY}`,
      },
    },
  },
  solidity: {
    version: "0.8.2",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
};
