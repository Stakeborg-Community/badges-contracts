A place for StakeborgDAO Community Badges smart contracts.

Development stack:

- [Hardhat](https://hardhat.org/)
- [VSCode](https://code.visualstudio.com/)
- [VSCode Solidity Extension](https://marketplace.visualstudio.com/items?itemName=JuanBlanco.solidity)
- [Alchemy](alchemy.com)
- [OpenZeppelin](https://openzeppelin.com/)

# How to set up development environment

- Create a mainnet archive Matic node on Alchemy

- add NODE_API_KEY to .env containing your Alchemy API KEY

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
