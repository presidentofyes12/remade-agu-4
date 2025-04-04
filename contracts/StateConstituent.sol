// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IConstituent.sol";
import "./interfaces/IDAOToken.sol";
import "./libraries/ProposalLib.sol";
import "./libraries/ChironStreamLib.sol";
import "./interfaces/ILogicConstituent.sol";

contract StateConstituent is IConstituent, AccessControl, ReentrancyGuard {
    using ProposalLib for ProposalLib.Proposal;

    function version() external pure returns (string memory) {
        return "1.0.0";
    }

    /*// NFT state management
    mapping(uint256 => mapping(address => uint256)) private _nftBalances;
    mapping(address => mapping(address => bool)) private _nftOperatorApprovals;
    mapping(uint256 => string) private _tokenURIs;
    uint256 private _nextTokenId = 1;

    // Unused NFT stuff
    function updateNFTBalance(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bool isMinting
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (isMinting) {
            _nftBalances[id][to] += amount;
        } else {
            require(_nftBalances[id][from] >= amount, "Insufficient NFT balance");
            _nftBalances[id][from] -= amount;
            _nftBalances[id][to] += amount;
        }
    }

    function getNFTBalance(address account, uint256 id) external view returns (uint256) {
        return _nftBalances[id][account];
    }

    function setNFTApproval(address owner, address operator, bool approved) external {
        require(msg.sender == owner || hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Not authorized");
        _nftOperatorApprovals[owner][operator] = approved;
    }

    // Fixed return type from uint256 to bool to match the mapping
    function isNFTApprovedForAll(address owner, address operator) external view returns (bool) {
        return _nftOperatorApprovals[owner][operator];
    }

    function setTokenURI(uint256 tokenId, string memory uri) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _tokenURIs[tokenId] = uri;
    }

    function getTokenURI(uint256 tokenId) external view returns (string memory) {
        return _tokenURIs[tokenId];
    }

    function getNextTokenId() external view returns (uint256) {
        return _nextTokenId;
    }

    function incrementTokenId() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _nextTokenId++;
    }*/

    // Updated event to include stake amount
    event MemberJoined(
        address indexed member, 
        uint256 indexed daoId, 
        uint256 timestamp,
        uint256 stakeAmount
    );

    function joinDAO(uint256 daoId) external payable nonReentrant {
        DAONode storage dao = daos[daoId];
        require(dao.active, "DAO is not active");
        require(dao.daoAddress != address(0), "DAO not properly initialized");
        require(!isActiveMember[msg.sender], "Already a DAO member");
        
        uint256 minPLS = 1 ether; // 1 PLS minimum
        require(msg.value >= minPLS, "Insufficient PLS sent");
        
        // Handle the PLS stake
        uint256 stakeAmount = minPLS;
        uint256 excess = msg.value - stakeAmount;
        
        // Record the stake
        stakes[msg.sender] = stakeAmount;
        
        // Send excess PLS back if any
        if (excess > 0) {
            (bool success, ) = msg.sender.call{value: excess}("");
            require(success, "Failed to return excess PLS");
        }
        
        // Send stake to DAO treasury
        (bool success2, ) = dao.daoAddress.call{value: stakeAmount}("");
        require(success2, "Failed to transfer stake to DAO");

        // Initialize vouching info
        VouchInfo storage vInfo = memberVouches[msg.sender];
        require(vInfo.vouchers.length == 0, "Vouch info already initialized");
        
        // Initialize vouchers array properly
        vInfo.vouchers = new address[](0);
        vInfo.vouchCount = 0;
        vInfo.joinTimestamp = block.timestamp;
        vInfo.isGenesisAccount = false;
        vInfo.hasFullAllocation = false;

        // Initialize member state
        isActiveMember[msg.sender] = true;
        activeMemberCount++;
        
        // Initialize reputation score
        reputationScores[msg.sender] = 100;
        
        // Record activity timestamp
        lastActivityTimestamp[msg.sender] = block.timestamp;
        
        // Initialize other member mappings with default values
        //stakingBalances[msg.sender] = 0;
        //liquidityProvided[msg.sender] = 0;
        //pendingRewards[msg.sender] = 0;
        //dailyTokens[msg.sender] = 0;
        //lastAllocationReset[msg.sender] = block.timestamp;
        
        // Add member to index
        memberIndex[memberCount] = msg.sender;
        memberCount++;

        // Add to locations if applicable
        uint256 defaultLocationId = 1;
        Location storage location = locations[defaultLocationId];
        location.memberCount++;
        
        // Initialize connection reward structure
        connectionRewards[msg.sender] = ConnectionReward({
            claimed: false,
            deadline: block.timestamp + 30 days,
            connectionTarget: 3,
            currentConnections: 0,
            rewardAmount: 100 * 10**18,
            allowPartial: true
        });

        // Update DAO analytics
        daoAnalytics.activeUsers++;

        // Call the DAOToken to register the member
        try IDAOToken(dao.daoAddress).registerMember(msg.sender, false) {
            // Successfully registered in token contract
        } catch {
            revert("Failed to register in token contract");
        }
        
        emit MemberJoined(msg.sender, daoId, block.timestamp, stakeAmount);
    }

    // Add this helper function to add connections
    function addConnection(
        address target,
        uint256 trustScore,
        bool isFamilial,
        bool isInstitutional
    ) external {
        require(isActiveMember[msg.sender], "Not a member");
        require(isActiveMember[target], "Target not a member");
        require(msg.sender != target, "Cannot connect to self");
        
        Connection memory newConnection = Connection({
            target: target,
            trustScore: trustScore,
            isFamilial: isFamilial,
            isInstitutional: isInstitutional
        });
        
        connections[msg.sender].push(newConnection);
        connectionRewards[msg.sender].currentConnections++;
    }

    // Add the vouching function
    function vouchForMember(address newMember) external {
        require(isActiveMember[msg.sender], "Not a DAO member");
        require(isActiveMember[newMember], "Target is not a member");
        require(!hasVouched[msg.sender][newMember], "Already vouched");
        require(msg.sender != newMember, "Cannot vouch for self");
        
        VouchInfo storage vInfo = memberVouches[newMember];
        require(!vInfo.isGenesisAccount, "Cannot vouch for genesis account");
        require(!vInfo.hasFullAllocation, "Already has full allocation");
        require(vInfo.vouchCount < 6, "Already has maximum vouches");
        
        // Record the vouch
        vInfo.vouchers.push(msg.sender);
        vInfo.vouchCount++;
        hasVouched[msg.sender][newMember] = true;
        
        // Check if they now have full allocation
        if (vInfo.vouchCount == 6) {
            vInfo.hasFullAllocation = true;
        }
        
        emit NewVouch(msg.sender, newMember, vInfo.vouchCount);
    }

    event NewVouch(address indexed voucher, address indexed member, uint256 totalVouches);

    event DAORegistered(uint256 indexed globalId, address indexed daoAddress, uint256 level);
    event VoteCast(uint256 indexed proposalId, address indexed voter, bool support, uint256 votes);

    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        uint8 category,
        uint256 startEpoch,
        uint256 endEpoch,
        uint256 proposerReputation
    );

    event ProposalStateChanged(
        uint256 indexed proposalId,
        uint8 fromState,
        uint8 toState,
        uint256 timestamp,
        bytes32 indexed txHash
    );

    event ProposalExecuted(
        uint256 indexed proposalId,
        address indexed executor,
        uint256 timestamp,
        uint256 forVotes,
        uint256 againstVotes
    );

    function registerDAO(
        address daoAddress,
        uint256 level,
        int256[3] memory constituents
    ) external onlyRole(DEFAULT_ADMIN_ROLE) returns (uint256) {
        require(daoAddress != address(0), "Invalid DAO address");
        require(level > 0 && level <= 12, "Invalid level");
        
        // Validate using LogicConstituent
        bool isValidRoot = level == 1 && ILogicConstituent(logicConstituent).validateRootDAO(
            daoCountAtLevel[level],
            level,
            daoCountAtLevel[level]
        );
        require(isValidRoot || level > 1, "Invalid root DAO");
        
        globalDaoCount++;
        uint256 localId = daoCountAtLevel[level] + 1;
        
        DAONode storage dao = daos[globalDaoCount];
        dao.id = localId;
        dao.globalId = globalDaoCount;
        dao.level = level;
        dao.constituents = constituents;
        dao.daoAddress = daoAddress;
        dao.active = true;
        
        daosByLevel[level][localId] = globalDaoCount;
        daoCountAtLevel[level]++;
        
        emit DAORegistered(globalDaoCount, daoAddress, level);
        return globalDaoCount;
    }

    // Add address for LogicConstituent
    address public logicConstituent;
    
    // Add setter for LogicConstituent address
    function setLogicConstituent(address _logicConstituent) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_logicConstituent != address(0), "Invalid logic constituent");
        logicConstituent = _logicConstituent;
    }

    function castVote(
        uint256 proposalId,
        bool support,
        uint256 voteAmount
    ) external nonReentrant {
        require(isActiveMember[msg.sender], "Not a member");
        ProposalLib.Proposal storage proposal = proposals[proposalId];
        require(!proposal.executed, "Already executed");
        require(!canceled[proposalId], "Proposal canceled");
        require(
            currentEpoch >= proposal.startEpoch && 
            currentEpoch <= proposal.endEpoch, 
            "Voting closed"
        );
        require(!proposal.receipts[msg.sender].hasVoted, "Already voted");
        
        // Calculate unique voters - use the receipt mapping to count
        uint256 currentVoters = proposal.receipts[msg.sender].hasVoted ? 
            proposal.uniqueVoters : 
            proposal.uniqueVoters + 1;
        
        // Use interface to validate quorum
        bool quorumValid = ILogicConstituent(logicConstituent).validateQuorum(
            proposal.forVotes + proposal.againstVotes + voteAmount,
            support ? proposal.forVotes + voteAmount : proposal.forVotes,
            support ? proposal.againstVotes : proposal.againstVotes + voteAmount,
            currentVoters,
            activeMemberCount,
            currentStage
        );
        require(quorumValid, "Invalid vote");
        
        // Update vote tallies
        if (support) {
            proposal.forVotes += voteAmount;
        } else {
            proposal.againstVotes += voteAmount;
        }
        
        // Record receipt
        proposal.receipts[msg.sender].hasVoted = true;
        proposal.receipts[msg.sender].support = support;
        proposal.receipts[msg.sender].votes = voteAmount;
        
        // Update unique voters count
        if (!proposal.receipts[msg.sender].hasVoted) {
            proposal.uniqueVoters++;
        }
        
        emit VoteCast(proposalId, msg.sender, support, voteAmount);
    }


    // Add the helper view function
    function getMemberVouchInfo(address member) external view returns (
        uint256 vouchCount,
        bool isGenesis,
        bool hasFullAllocation
    ) {
        VouchInfo storage vInfo = memberVouches[member];
        return (vInfo.vouchCount, vInfo.isGenesisAccount, vInfo.hasFullAllocation);
    }

    struct Connection {
        address target;
        uint256 trustScore;
        bool isFamilial;
        bool isInstitutional;
    }

    struct ConnectionReward {
        bool claimed;
        uint256 deadline;
        uint256 connectionTarget;
        uint256 currentConnections;
        uint256 rewardAmount;
        bool allowPartial;
    }

    struct MediaContent {
        bytes32 contentHash;
        string mediaType;
        uint256 timestamp;
        address uploader;
        bool isProcessed;
        bytes32[] relatedContent;
    }

    IERC20 public immutable token;
    
    // Core DAO state 
    mapping(uint256 => ProposalLib.Proposal) public proposals;
    mapping(uint256 => bool) public canceled;
    mapping(address => uint256) public reputationScores;
    //mapping(address => uint256) public stakingBalances;
    //mapping(address => uint256) public liquidityProvided;
    mapping(address => Connection[]) public connections;
    mapping(address => ConnectionReward) public connectionRewards;
    //mapping(address => uint256) public pendingRewards;

    /*mapping(address => uint256) public dailyTokens;
    mapping(address => uint256) public lastAllocationReset;*/
    mapping(address => bool) public isActiveMember;

    // Enhanced DAO state
    mapping(uint256 => DAONode) public daos;
    mapping(uint256 => mapping(uint256 => uint256)) public daosByLevel;
    mapping(uint256 => uint256) public daoCountAtLevel;
    uint256 public globalDaoCount;
    
    struct DAONode {
        uint256 id;
        uint256 globalId;
        uint256 parentId;
        uint256 rootId;
        uint256 level;
        int256[3] constituents;
        address daoAddress;
        uint256[] childIds;
        bool active;
    }
    
    // Staking and liquidity state
    mapping(address => uint256) public stakes;
    //mapping(address => uint256) public liquidityShares;
    
    // ChironStream state
    mapping(uint256 => mapping(uint256 => ChironStreamLib.ChironSlot)) public chironSlots;
    
    // ChironStream slot functions
    function getChironSlotInfo(uint256 locationId, uint256 slotId) external view returns (uint256, uint256, bool) {
        ChironStreamLib.ChironSlot storage slot = chironSlots[locationId][slotId];
        return (slot.durationMs, slot.patternValue, slot.isActive);
    }

    function initializeChironSlot(
        uint256 locationId,
        uint256 slotId,
        uint256 durationMs,
        uint256 patternValue
    ) external {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Not authorized");
        ChironStreamLib.ChironSlot storage slot = chironSlots[locationId][slotId];
        slot.slotId = slotId;
        slot.durationMs = durationMs;
        slot.patternValue = patternValue;
        slot.isActive = true;
        slot.lastUpdateTime = block.timestamp;
    }

    function updateChironSlot(
        uint256 locationId, 
        uint256 slotId, 
        uint256 durationMs,
        uint256 patternValue,
        bool isActive
    ) external {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Not authorized");
        ChironStreamLib.ChironSlot storage slot = chironSlots[locationId][slotId];
        slot.durationMs = durationMs;
        slot.patternValue = patternValue;
        slot.isActive = isActive;
        slot.lastUpdateTime = block.timestamp;
    }
    
    uint256 public proposalCount;
    uint256 public currentEpoch;
    uint256 public currentStage;
    uint256 public lastEpochUpdate;
    uint256 public activeMemberCount;
    
    // Analytics state
    struct AnalyticsData {
        uint256 activeUsers;
    }
    AnalyticsData public daoAnalytics;
    
    // Add to StateConstituent.sol state variables
    struct VouchInfo {
        address[] vouchers;          // List of addresses that have vouched
        uint256 vouchCount;          // Current number of vouches
        uint256 joinTimestamp;       // When they joined the DAO
        bool isGenesisAccount;       // If they were the creator
        bool hasFullAllocation;      // If they've received all vouches
    }

    mapping(address => VouchInfo) public memberVouches;
    mapping(address => mapping(address => bool)) public hasVouched; // track who has vouched for whom

    // Member activity state
    mapping(address => uint256) public lastActivityTimestamp;
    
    // Location state
    struct Location {
        uint256 id;
        bytes32 coordinates;
        uint256 memberCount;
        uint256 reputation;
    }
    mapping(uint256 => Location) public locations;

    constructor(address _token) {
        token = IERC20(_token);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    // Add missing state mappings
    mapping(uint256 => uint8) public proposalStage;
    mapping(uint256 => address) private memberIndex;
    uint256 private memberCount;
    
    function createProposal(
        address proposer,
        uint8 category,
        uint256 startEpoch,
        uint256 endEpoch
    ) external returns (uint256) {
        proposalCount++;
        ProposalLib.Proposal storage proposal = proposals[proposalCount];
        proposal.id = proposalCount;
        proposal.proposer = proposer;
        proposal.startEpoch = startEpoch;
        proposal.endEpoch = endEpoch;
        proposal.category = category;
        proposal.proposerReputation = reputationScores[proposer];
        proposalStage[proposalCount] = 1; // Set initial stage

        // Emit the ProposalCreated event
        emit ProposalCreated(
            proposalCount,
            proposer,
            category,
            startEpoch,
            endEpoch,
            proposal.proposerReputation
        );
        
        return proposalCount;
    }

    function updateProposalState(
        uint256 proposalId,
        uint8 newState
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(proposalId <= proposalCount, "Invalid proposal ID");
        require(newState > 0, "Invalid state");
        
        uint8 oldState = proposalStage[proposalId];
        require(oldState != newState, "State unchanged");
        
        proposalStage[proposalId] = newState;
        
        // Emit the ProposalStateChanged event
        emit ProposalStateChanged(
            proposalId,
            oldState,
            newState,
            block.timestamp,
            blockhash(block.number - 1) // Use previous block hash for transaction reference
        );
    }

    // Add the execute proposal function
    function executeProposal(
        uint256 proposalId
    ) external nonReentrant {
        require(proposalId <= proposalCount, "Invalid proposal ID");
        ProposalLib.Proposal storage proposal = proposals[proposalId];
        require(!proposal.executed, "Already executed");
        require(!canceled[proposalId], "Proposal canceled");
        
        // Check if proposal can be executed
        require(
            currentEpoch > proposal.endEpoch,
            "Voting period not ended"
        );
        
        // Use interface to validate execution conditions
        /*bool executionValid = ILogicConstituent(logicConstituent).validateExecution(
            proposal.forVotes,
            proposal.againstVotes,
            proposal.uniqueVoters,
            activeMemberCount,
            currentStage
        );
        require(executionValid, "Execution conditions not met");*/
        
        // Mark proposal as executed
        proposal.executed = true;
        
        // Emit the ProposalExecuted event
        emit ProposalExecuted(
            proposalId,
            msg.sender,
            block.timestamp,
            proposal.forVotes,
            proposal.againstVotes
        );
    }

    /*function updateStakingBalance(address user, uint256 amount, bool add) external {
        if(add) {
            stakingBalances[user] += amount;
        } else {
            stakingBalances[user] -= amount;
        }
    }

    function updateLiquidity(address user, uint256 amount, bool add) external {
        if(add) {
            liquidityProvided[user] += amount;
        } else {
            liquidityProvided[user] -= amount;
        }
    }*/

    function updateReputation(address user, uint256 newScore) external {
        reputationScores[user] = newScore;
    }

    function incrementEpoch() external onlyRole(DEFAULT_ADMIN_ROLE) {
        currentEpoch++;
        if(currentEpoch % 9 == 0) {
            currentStage++;
        }
        lastEpochUpdate = block.timestamp;
    }

    struct ProposalBasicInfo {
        uint256 startEpoch;
        uint256 endEpoch;
        bool isCanceled;
        bool executed;
        uint256 forVotes;
        uint256 againstVotes;
        uint8 stage;
        uint256 proposerReputation;
    }

    function getProposalBasicInfo(uint256 proposalId) external view returns (ProposalBasicInfo memory) {
        ProposalLib.Proposal storage proposal = proposals[proposalId];
        return ProposalBasicInfo({
            startEpoch: proposal.startEpoch,
            endEpoch: proposal.endEpoch,
            isCanceled: canceled[proposalId],
            executed: proposal.executed,
            forVotes: proposal.forVotes,
            againstVotes: proposal.againstVotes,
            stage: proposalStage[proposalId],
            proposerReputation: proposal.proposerReputation
        });
    }
}

