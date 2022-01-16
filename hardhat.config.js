/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();

const POLYGON_API_KEY = process.env.POLYGON_API_KEY;
const MUMBAI_API_KEY = process.env.MUMBAI_API_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const POLYSCAN_API_KEY = process.env.POLYSCAN_API_KEY;

module.exports = {
  networks: {
    hardhat: {
      forking: {
        url: `https://polygon-mainnet.g.alchemy.com/v2/${POLYGON_API_KEY}`,
      },
    },
    polygon: {
      url: `https://polygon-mainnet.g.alchemy.com/v2/${POLYGON_API_KEY}`,
      accounts: [`${PRIVATE_KEY}`],
    },
    polygonMumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${MUMBAI_API_KEY}`,
      accounts: [`${PRIVATE_KEY}`],
    },
  },
  etherscan: {
    apiKey: {
      // polygon
      polygon: POLYSCAN_API_KEY,
      polygonMumbai: POLYSCAN_API_KEY,
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
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
