A place for StakeborgDAO Community Badges smart contracts.

Development stack:

- [Hardhat](https://hardhat.org/)
- [VSCode](https://code.visualstudio.com/)
- [VSCode Solidity Extension](https://marketplace.visualstudio.com/items?itemName=JuanBlanco.solidity)
- [Ethernal](https://app.tryethernal.com/)
- [OpenZeppelin](https://openzeppelin.com/)
- [Alchemy](alchemy.com)

# How to set up development environment

- Create a mainnet archive Matic node on Alchemy

- Create secrets.json

> { "NODE_API_KEY": "here is your key" }

- Create an account on https://app.tryethernal.com/

- > npm install

will install all dependencies

- > npx hardhat node

will start a local fork of the network

- > npx hardhat run --network localhost scripts/deploy.js

will deploy the contract on local fork
