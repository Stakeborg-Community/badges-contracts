/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require("hardhat-ethernal");
const { NODE_API_KEY } = require("./secrets.json");

module.exports = {
  networks: {
    hardhat: {
      // forked mainnet used for testing
      forking: {
        url: `https://polygon-mainnet.g.alchemy.com/v2/${NODE_API_KEY}`,
      },
    },
  },
  solidity: "0.8.2",
};
