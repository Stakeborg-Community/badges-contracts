// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract SeniorityBadge is
    ERC721,
    ERC721Enumerable,
    ERC721URIStorage,
    Pausable,
    Ownable,
    AccessControl
{
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;
    uint256 public MAX_SUPPLY = 100;
    // Base URI
    string public baseURI;

    bytes32 public constant MINTER_ADMIN_ROLE = keccak256("MINTER_ADMIN_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant MINTED_ROLE = keccak256("MINTED_ROLE");

    constructor() ERC721("Seniority Badge", "SEN") {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(MINTER_ADMIN_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);
        _setupRole(MINTED_ROLE, msg.sender);

        _setRoleAdmin(MINTER_ADMIN_ROLE, DEFAULT_ADMIN_ROLE);
        _setRoleAdmin(MINTER_ROLE, MINTER_ADMIN_ROLE);
        _setRoleAdmin(MINTED_ROLE, DEFAULT_ADMIN_ROLE);

        pause();
    }

    /* admin stuff */

    function pause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    function setMaxSupply(uint256 new_supply)
        public
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        MAX_SUPPLY = new_supply;
    }

    function setURI(string memory uri) public onlyRole(DEFAULT_ADMIN_ROLE) {
        baseURI = uri;
    }

    /* admin stuff */

    function safeMint(address to) public onlyRole(MINTER_ROLE) whenNotPaused {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        require(_tokenIdCounter.current() <= MAX_SUPPLY, "Exceeded max supply");
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, baseURI);
        _revokeRole(MINTER_ROLE, to);
        _grantRole(MINTED_ROLE, to);
    }

    // overrides for some custom functionality

    // avoid setting MINTER twice
    function _grantRole(bytes32 role, address account)
        internal
        override(AccessControl)
    {
        if (hasRole(MINTED_ROLE, account) && role == MINTER_ROLE)
            revert(string(abi.encodePacked("Already was MINTER")));
        super._grantRole(role, account);
    }

    // MINTER needs it for minting, DEFAULT ADMIN can transfer with approval from owner
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721, ERC721Enumerable) whenNotPaused {
        require(
            hasRole(MINTER_ROLE, msg.sender) ||
                hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "not a MINTER or ADMIN"
        );
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }

    // we do not use indexes, there is only one URI
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return baseURI;
    }

    // The following functions are overrides required by Solidity.

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
