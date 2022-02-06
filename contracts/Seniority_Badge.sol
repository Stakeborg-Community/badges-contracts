// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155SupplyUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract SeniorityBadge is
    Initializable,
    ERC1155Upgradeable,
    AccessControlUpgradeable,
    PausableUpgradeable,
    ERC1155BurnableUpgradeable,
    ERC1155SupplyUpgradeable,
    UUPSUpgradeable
{
    using CountersUpgradeable for CountersUpgradeable.Counter;

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

    CountersUpgradeable.Counter private _bootstrapperCounter;
    CountersUpgradeable.Counter private _veteranCounter;
    CountersUpgradeable.Counter private _adopterCounter;
    CountersUpgradeable.Counter private _sustainerCounter;
    CountersUpgradeable.Counter private _believerCounter;

    bytes32 public merkleRoot_bootstrapper;
    bytes32 public merkleRoot_veteran;
    bytes32 public merkleRoot_adopter;
    bytes32 public merkleRoot_sustainer;
    bytes32 public merkleRoot_believer;

    mapping(address => bool) public bootstrapperClaimed;
    mapping(address => bool) public veteranClaimed;
    mapping(address => bool) public adopterClaimed;
    mapping(address => bool) public sustainerClaimed;
    mapping(address => bool) public believerClaimed;

    //admin roles
    bytes32 public constant SUPPLY_SETTER_ROLE =
        keccak256("SUPPLY_SETTER_ROLE");
    bytes32 public constant URI_SETTER_ROLE = keccak256("URI_SETTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    bytes32 public constant WHITELISTER_ROLE = keccak256("WHITELISTER_ROLE");

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() initializer {}

    function initialize() public initializer {
        __ERC1155_init(
            "https://stakeborgdao.xyz/api/badge/seniority/{id}.json"
        );
        __AccessControl_init();
        __Pausable_init();
        __ERC1155Burnable_init();
        __ERC1155Supply_init();
        __UUPSUpgradeable_init();

        __init_variables();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);

        _grantRole(URI_SETTER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(UPGRADER_ROLE, msg.sender);
        _grantRole(SUPPLY_SETTER_ROLE, msg.sender);
        _grantRole(WHITELISTER_ROLE, msg.sender);

        _setRoleAdmin(URI_SETTER_ROLE, DEFAULT_ADMIN_ROLE);
        _setRoleAdmin(PAUSER_ROLE, DEFAULT_ADMIN_ROLE);
        _setRoleAdmin(UPGRADER_ROLE, DEFAULT_ADMIN_ROLE);
        _setRoleAdmin(SUPPLY_SETTER_ROLE, DEFAULT_ADMIN_ROLE);
        _setRoleAdmin(WHITELISTER_ROLE, DEFAULT_ADMIN_ROLE);

        _pause();
    }

    function __init_variables() internal onlyInitializing {
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
    }

    function setMerkleRoots(
        bytes32 _bootstrapperMerkleRoot,
        bytes32 _veteranMerkleRoot,
        bytes32 _adopterMerkleRoot,
        bytes32 _sustainerMerkleRoot,
        bytes32 _believerMerkleRoot
    ) external onlyRole(WHITELISTER_ROLE) {
        merkleRoot_bootstrapper = _bootstrapperMerkleRoot;
        merkleRoot_veteran = _veteranMerkleRoot;
        merkleRoot_adopter = _adopterMerkleRoot;
        merkleRoot_sustainer = _sustainerMerkleRoot;
        merkleRoot_believer = _believerMerkleRoot;
    }

    function setURI(string memory newuri) external onlyRole(URI_SETTER_ROLE) {
        _setURI(newuri);
    }

    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function setSupply(
        uint256 bootstrapperNewSupply,
        uint256 veteranNewSupply,
        uint256 adopterNewSupply,
        uint256 sustainerNewSupply,
        uint256 believerNewSupply
    ) external onlyRole(SUPPLY_SETTER_ROLE) {
        BOOTSTRAPPER_SUPPLY = bootstrapperNewSupply;
        VETERAN_SUPPLY = veteranNewSupply;
        ADOPTER_SUPPLY = adopterNewSupply;
        SUSTAINER_SUPPLY = sustainerNewSupply;
        BELIEVER_SUPPLY = believerNewSupply;
    }

    function verifyMerkleProof(
        bytes32[] memory proof,
        bytes32 root,
        address sender
    ) internal pure returns (bool) {
        bytes32 leaf = keccak256(abi.encodePacked(sender));
        return MerkleProof.verify(proof, root, leaf);
    }

    function mintBootstrapper(bytes32[] calldata _proof)
        external
        whenNotPaused
    {
        require(!bootstrapperClaimed[msg.sender], "Already claimed");
        require(
            _bootstrapperCounter.current() < BOOTSTRAPPER_SUPPLY,
            "Exceeded max supply"
        );
        require(
            verifyMerkleProof(_proof, merkleRoot_bootstrapper, msg.sender),
            "Invalid proof"
        );

        _bootstrapperCounter.increment();
        _mint(msg.sender, BOOTSTRAPPER, 1, "");
        bootstrapperClaimed[msg.sender] = true;
    }

    function mintVeteran(bytes32[] calldata _proof)
        external
        whenNotPaused
    {
        require(!veteranClaimed[msg.sender], "Already claimed");
        require(
            _veteranCounter.current() < VETERAN_SUPPLY,
            "Exceeded max supply"
        );
        require(
            verifyMerkleProof(_proof, merkleRoot_veteran, msg.sender),
            "Invalid proof"
        );

        _veteranCounter.increment();
        _mint(msg.sender, VETERAN, 1, "");
        veteranClaimed[msg.sender] = true;
    }

    function mintAdopter(bytes32[] calldata _proof)
        external
        whenNotPaused
    {
        require(!adopterClaimed[msg.sender], "Already claimed");
        require(
            _adopterCounter.current() < ADOPTER_SUPPLY,
            "Exceeded max supply"
        );
        require(
            verifyMerkleProof(_proof, merkleRoot_adopter, msg.sender),
            "Invalid proof"
        );

        _adopterCounter.increment();
        _mint(msg.sender, ADOPTER, 1, "");
        adopterClaimed[msg.sender] = true;
    }

    function mintSustainer(bytes32[] calldata _proof)
        external
        whenNotPaused
    {
        require(!sustainerClaimed[msg.sender], "Already claimed");
        require(
            _sustainerCounter.current() < SUSTAINER_SUPPLY,
            "Exceeded max supply"
        );
        require(
            verifyMerkleProof(_proof, merkleRoot_sustainer, msg.sender),
            "Invalid proof"
        );

        _sustainerCounter.increment();
        _mint(msg.sender, SUSTAINER, 1, "");
        sustainerClaimed[msg.sender] = true;
    }

    function mintBeliever(bytes32[] calldata _proof)
        external
        whenNotPaused
    {
        require(!believerClaimed[msg.sender], "Already claimed");
        require(
            _believerCounter.current() < BELIEVER_SUPPLY,
            "Exceeded max supply"
        );
        require(
            verifyMerkleProof(_proof, merkleRoot_believer, msg.sender),
            "Invalid proof"
        );

        _believerCounter.increment();
        _mint(msg.sender, BELIEVER, 1, "");
        believerClaimed[msg.sender] = true;
    }

    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    )
        internal
        override(ERC1155Upgradeable, ERC1155SupplyUpgradeable)
        whenNotPaused
    {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyRole(UPGRADER_ROLE)
    {}

    // The following functions are overrides required by Solidity.

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155Upgradeable, AccessControlUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
