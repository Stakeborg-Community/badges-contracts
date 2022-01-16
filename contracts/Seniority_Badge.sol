// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract SeniorityBadge is
    ERC1155,
    AccessControl,
    Pausable,
    ERC1155Burnable,
    ERC1155Supply
{
    using Counters for Counters.Counter;

    uint256 public BOOTSTRAPPER;
    uint256 public VETERAN;
    uint256 public ADOPTER;
    uint256 public SUSTAINER;
    uint256 public BELIEVER;

    uint256 public BOOTSTRAPPER_SUPPLY;
    uint256 public VETERAN_SUPPLY;
    uint256 public ADOPTER_SUPPLY;
    uint256 public SUSTAINER_SUPPLY;
    uint256 public BELIEVER_SUPPLY;

    Counters.Counter private _bootstrapperCounter;
    Counters.Counter private _veteranCounter;
    Counters.Counter private _adopterCounter;
    Counters.Counter private _sustainerCounter;
    Counters.Counter private _believerCounter;

    //admin roles
    bytes32 public constant SUPPLY_SETTER_ROLE =
        keccak256("SUPPLY_SETTER_ROLE");
    bytes32 public constant URI_SETTER_ROLE = keccak256("URI_SETTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    //minting roles
    bytes32 public constant MINTER_ADMIN_ROLE = keccak256("MINTER_ADMIN_ROLE");
    bytes32 public constant MINTER_BOOTSTRAPPER_ROLE =
        keccak256("MINTER_BOOTSTRAPPER_ROLE");
    bytes32 public constant MINTER_VETERAN_ROLE =
        keccak256("MINTER_VETERAN_ROLE");
    bytes32 public constant MINTER_ADOPTER_ROLE =
        keccak256("MINTER_ADOPTER_ROLE");
    bytes32 public constant MINTER_SUSTAINER_ROLE =
        keccak256("MINTER_SUSTAINER_ROLE");
    bytes32 public constant MINTER_BELIEVER_ROLE =
        keccak256("MINTER_BELIEVER_ROLE");

    bytes32 public constant MINTED_ROLE = keccak256("MINTED_ROLE");

    constructor()
        ERC1155("https://stakeborgdao.xyz/api/badge/seniority/{id}.json")
    {
        BOOTSTRAPPER = 0;
        VETERAN = 1;
        ADOPTER = 2;
        SUSTAINER = 3;
        BELIEVER = 4;

        BOOTSTRAPPER_SUPPLY = 50;
        VETERAN_SUPPLY = 100;
        ADOPTER_SUPPLY = 250;
        SUSTAINER_SUPPLY = 500;
        BELIEVER_SUPPLY = 1000;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);

        _grantRole(URI_SETTER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(SUPPLY_SETTER_ROLE, msg.sender);

        _setRoleAdmin(URI_SETTER_ROLE, DEFAULT_ADMIN_ROLE);
        _setRoleAdmin(PAUSER_ROLE, DEFAULT_ADMIN_ROLE);
        _setRoleAdmin(SUPPLY_SETTER_ROLE, DEFAULT_ADMIN_ROLE);

        _grantRole(MINTER_ADMIN_ROLE, msg.sender);

        _setRoleAdmin(MINTER_ADMIN_ROLE, DEFAULT_ADMIN_ROLE);
        _setRoleAdmin(MINTER_BOOTSTRAPPER_ROLE, MINTER_ADMIN_ROLE);
        _setRoleAdmin(MINTER_VETERAN_ROLE, MINTER_ADMIN_ROLE);
        _setRoleAdmin(MINTER_ADOPTER_ROLE, MINTER_ADMIN_ROLE);
        _setRoleAdmin(MINTER_SUSTAINER_ROLE, MINTER_ADMIN_ROLE);
        _setRoleAdmin(MINTER_BELIEVER_ROLE, MINTER_ADMIN_ROLE);

        pause();
    }

    function setURI(string memory newuri) public onlyRole(URI_SETTER_ROLE) {
        _setURI(newuri);
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function setBootstrapperSupply(uint256 newSupply)
        public
        onlyRole(SUPPLY_SETTER_ROLE)
    {
        BOOTSTRAPPER_SUPPLY = newSupply;
    }

    function setVeteranSupply(uint256 newSupply)
        public
        onlyRole(SUPPLY_SETTER_ROLE)
    {
        VETERAN_SUPPLY = newSupply;
    }

    function setAdopterSupply(uint256 newSupply)
        public
        onlyRole(SUPPLY_SETTER_ROLE)
    {
        ADOPTER_SUPPLY = newSupply;
    }

    function setSustainerSupply(uint256 newSupply)
        public
        onlyRole(SUPPLY_SETTER_ROLE)
    {
        SUSTAINER_SUPPLY = newSupply;
    }

    function setBelieverSupply(uint256 newSupply)
        public
        onlyRole(SUPPLY_SETTER_ROLE)
    {
        BELIEVER_SUPPLY = newSupply;
    }

    function mint() public whenNotPaused {
        if (hasRole(MINTER_BOOTSTRAPPER_ROLE, msg.sender)) {
            _bootstrapperCounter.increment();
            require(
                _bootstrapperCounter.current() <= BOOTSTRAPPER_SUPPLY,
                "Exceeded max supply"
            );
            _mint(msg.sender, BOOTSTRAPPER, 1, "");
            _revokeRole(MINTER_BOOTSTRAPPER_ROLE, msg.sender);
        }
        if (hasRole(MINTER_VETERAN_ROLE, msg.sender)) {
            _veteranCounter.increment();
            require(
                _veteranCounter.current() <= VETERAN_SUPPLY,
                "Exceeded max supply"
            );
            _mint(msg.sender, VETERAN, 1, "");
            _revokeRole(MINTER_VETERAN_ROLE, msg.sender);
        }
        if (hasRole(MINTER_ADOPTER_ROLE, msg.sender)) {
            _adopterCounter.increment();
            require(
                _adopterCounter.current() <= ADOPTER_SUPPLY,
                "Exceeded max supply"
            );
            _mint(msg.sender, ADOPTER, 1, "");
            _revokeRole(MINTER_ADOPTER_ROLE, msg.sender);
        }
        if (hasRole(MINTER_SUSTAINER_ROLE, msg.sender)) {
            _sustainerCounter.increment();
            require(
                _sustainerCounter.current() <= SUSTAINER_SUPPLY,
                "Exceeded max supply"
            );
            _mint(msg.sender, SUSTAINER, 1, "");
            _revokeRole(MINTER_SUSTAINER_ROLE, msg.sender);
        }
        if (hasRole(MINTER_BELIEVER_ROLE, msg.sender)) {
            _believerCounter.increment();
            require(
                _believerCounter.current() <= BELIEVER_SUPPLY,
                "Exceeded max supply"
            );
            _mint(msg.sender, BELIEVER, 1, "");
            _revokeRole(MINTER_BELIEVER_ROLE, msg.sender);
        }
        _grantRole(MINTED_ROLE, msg.sender);
    }

    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal override(ERC1155, ERC1155Supply) whenNotPaused {
        // transfers available only during minting or by ADMIN.
        // transfers made by ADMIN require allowance from user
        require(
            hasRole(MINTER_BOOTSTRAPPER_ROLE, operator) ||
                hasRole(MINTER_VETERAN_ROLE, operator) ||
                hasRole(MINTER_ADOPTER_ROLE, operator) ||
                hasRole(MINTER_SUSTAINER_ROLE, operator) ||
                hasRole(MINTER_BELIEVER_ROLE, operator) ||
                hasRole(DEFAULT_ADMIN_ROLE, operator),
            "not a MINTER or ADMIN"
        );
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }

    // The following functions are overrides required by Solidity.

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
