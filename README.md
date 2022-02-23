A place for StakeborgDAO Community Badges smart contracts.

Development stack:

- [Hardhat](https://hardhat.org/)
- [VSCode](https://code.visualstudio.com/)
- [VSCode Solidity Extension](https://marketplace.visualstudio.com/items?itemName=JuanBlanco.solidity)
- [Alchemy](https://alchemy.com)
- [OpenZeppelin](https://openzeppelin.com/)

# How to set up development environment

- Create a mainnet archive Matic node on Alchemy

- add POLYGON_API_KEY to .env containing your Alchemy API KEY

- > npm install

will install all dependencies

- > npx hardhat test

will run all tests

- > npx hardhat coverage

will run all tests with code coverage

- > npx hardhat node

will start a local fork of the network

- > npx hardhat run --network localhost scripts/deploy.js

will deploy the contract on local fork

# Environment requirements

> POLYGON_API_KEY

Alchemy API key for Polygon network

---

> MUMBAI_API_KEY

Alchemy API key for Mumbai network

---

> DEPLOYER_PRIVATE_KEY

32 bytes hex private key for deployer account

---

> POLYSCAN_API_KEY

Polyscan API key used for verification

# Deployment

npx hardhat run scripts/deploy.js --network _network-name_

Where `network-name` is

- polygon
- polygonMumbai

Deployment details:

- Smart contract deploys paused
- `SUPPLY_SETTER_ROLE` role sets supply for all tokens
- `URI_SETTER_ROLE` role sets URI for all tokens
- `PAUSER_ROLE` can pause or unpause smart contract
- `UPGRADER_ROLE` can upgrade contract
- `WHITELISTER_ROLE` can set merkleroots
- `MINTER_ROLE` is only used internally during minting. `MINTER_ROLE` should not be set manually.

# Whitelisting

## Environment requirements

> INFURA_PROJECT_ID

Infura project id (API KEY)

---

> XYZ_API_USER

stakeborgdao.xyz username

---

> XYZ_API_KEY

stakeborgdao.xyz API key

---

`node scripts/xyzMerkleRoots.js` will pull data from stakeborgdao.xyz API and generate or update whitelist files in `/data`
