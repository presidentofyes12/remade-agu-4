// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

// Token contract with value creation mechanics
contract DAOToken is ERC20, ReentrancyGuard {
    using ECDSA for bytes32;

    // Core constants aligned with DAO system
    //uint256 public constant COMPLETE_CYCLE = 108 * 24 * 60 * 60;      // 108 days in seconds
    //uint256 public constant MARKET_PORTION = 7407407407;    // 7.407407407% expressed as parts per 100B;

    // Add these with the other state variables:
    //uint256 public constant ANNUAL_SUPPLY = 31556941100000;
    //uint256 public constant DAILY_SUPPLY = ANNUAL_SUPPLY / 365;
    uint256 public treasuryBalance;
    uint256 public lastDailyPrice;
    uint256 public currentDailyPrice;
    
    uint256 public constant ANNUAL_SUPPLY = 31557625344000;           // New precise annual supply
    uint256 public constant DAILY_SUPPLY = 86400000000;               // Fixed daily supply
    //uint256 public constant PER_USER_BASE = 7407407407;              // 7.40740740740 in fixed point (9 decimals)
    //uint256 public constant TARGET_USERS = 11664000000;               // Target user population
    //uint256 public constant MARKET_PORTION = 7407407407;             // Keep existing 7.407407407% value
    //uint256 public constant SEVEN_FOUR = 7407407407;             // MARKET_PORTION and PER_USER_BASE- both 7.407407407% value

    uint256 public lastAnnualMint;
    mapping(address => uint256) public daoBiddingShares;
    mapping(address => BidInfo[]) public permanentBids;
    mapping(address => BidInfo[]) public temporaryBids;
    mapping(address => bool) public isDaoMember;  // Used in placePermanentBid but not declared

    mapping(uint256 => address) public activeUserIndex;  // Maps index to user address
    mapping(address => uint256) public activeUserPosition; // Maps user address to their index
    address[] public activeDaoList;  // Array to track active DAOs  // Array to track active DAOs
    mapping(address => uint256) public daoPosInList; // Track DAO position in array
    
    // Value creation and marketplace structures
    struct Team {
        uint256 id;
        address[] members;
        uint256 valueCreated;
        uint256 lastActivityTimestamp;
        bool active;
    }

    // First, let's add a helper function to check if a DAO is active
    function isActiveDAO(address dao) internal view returns (bool) {
        // We can use the daoPosInList mapping we already have
        // If the DAO exists in the list, it will have a valid position stored
        // Note: We need to check if the address at that position matches, 
        // since we might have stale mapping data
        uint256 position = daoPosInList[dao];
        return position < activeDaoList.length && activeDaoList[position] == dao;
    }

    // Now we can update the registerMember function
    function registerMember(address member) external {
        // Use our new helper function instead of the non-existent contains method
        require(isActiveDAO(msg.sender), "Not an active DAO");
        
        // Set member status
        isDaoMember[member] = true;
        
        // Initialize bidding shares
        daoBiddingShares[member] = 1; // Start with 1% minimum share
        
        // Record initial activity
        recordActivity(member);
        
        // Add to active user tracking
        if (!isActiveUser[member]) {
            isActiveUser[member] = true;
            activeUserIndex[activeUserCount] = member;
            activeUserPosition[member] = activeUserCount;
            activeUserCount++;
            emit UserStatusChanged(member, true, block.timestamp);
        }
    }

    // Calculate total active bids for a DAO
    function getTotalDaoBids(address dao) public view returns (uint256) {
        uint256 total = 0;
        BidInfo[] storage bids = permanentBids[dao];

        // Sum up all unsettled permanent bids
        for(uint256 i = 0; i < bids.length; i++) {
            if(!bids[i].isSettled) {
                total += bids[i].amount;
            }
        }
        return total;
    }

    // Calculate time-based weight for temporary bids
    /*function getTimeWeight(uint256 timestamp) public view returns (uint256) {
        // Higher weight (penalty) closer to daily settlement
        //uint256 secondsUntilSettlement = 24 hours - (timestamp % 24 hours);
        // Returns 1.0 (1e18) to 2.0 (2e18) based on time until settlement
        return 1e18 + ((24 hours - (24 hours - (timestamp % 24 hours))) * 1e18) / 24 hours;
    }*/

    // Settle permanent bids for the day
    function settlePermanentBids(uint256 dailyMarketPortion) internal {
        uint256 totalSettled = 0;
        
        // Use activeDaoList directly instead of getActiveDaos
        for(uint256 i = 0; i < activeDaoList.length; i++) {
            address dao = activeDaoList[i];
            BidInfo[] storage bids = permanentBids[dao];
            
            for(uint256 j = 0; j < bids.length; j++) {
                if(!bids[j].isSettled && 
                totalSettled + bids[j].amount <= dailyMarketPortion) {
                    bids[j].isSettled = true;
                    totalSettled += bids[j].amount;
                    _transfer(address(this), dao, bids[j].amount);
                    emit BidSettled(dao, true, bids[j].amount, bids[j].price);
                }
            }
        }
    }

    function getAllTemporaryBids() internal view returns (BidInfo[] memory) {
        // First, count total temporary bids
        uint256 totalBids = 0;
        for(uint256 i = 0; i < activeDaoList.length; i++) {
            totalBids += temporaryBids[activeDaoList[i]].length;
        }

        BidInfo[] memory allBids = new BidInfo[](totalBids);
        uint256 currentIndex = 0;

        // Collect all bids
        for(uint256 i = 0; i < activeDaoList.length; i++) {
            BidInfo[] storage daoBids = temporaryBids[activeDaoList[i]];
            for(uint256 j = 0; j < daoBids.length; j++) {
                if(!daoBids[j].isSettled) {
                    allBids[currentIndex] = daoBids[j];
                    currentIndex++;
                }
            }
        }

        return allBids;
    }

    function sortBidsByPrice(BidInfo[] memory bids) internal pure {
        // Simple bubble sort implementation
        for(uint256 i = 0; i < bids.length; i++) {
            for(uint256 j = 0; j < bids.length - i - 1; j++) {
                if(bids[j].price < bids[j + 1].price) {
                    BidInfo memory temp = bids[j];
                    bids[j] = bids[j + 1];
                    bids[j + 1] = temp;
                }
            }
        }
    }

    function getBidDao(BidInfo memory bid) internal view returns (address) {
        // Search through DAOs to find bid owner
        for(uint256 i = 0; i < activeDaoList.length; i++) {
            address dao = activeDaoList[i];
            BidInfo[] storage daoBids = temporaryBids[dao];
            for(uint256 j = 0; j < daoBids.length; j++) {
                if(daoBids[j].timestamp == bid.timestamp && 
                   daoBids[j].amount == bid.amount &&
                   daoBids[j].price == bid.price) {
                    return dao;
                }
            }
        }
        revert("Bid DAO not found");
    }
    
    modifier onlyDAO() {
        require(isQuorumAchieved(msg.sender), "Quorum not achieved");
        _;
    }

function isQuorumAchieved(address proposer) internal view returns (bool) {
    require(isActiveUser[proposer], "Proposer not active");
    uint256 supportCount = 0;
    
    // Use existing activeUserIndex mapping for efficient iteration
    for(uint256 i = 0; i < activeUserCount; i++) {
        // Users support is tracked through their bidding shares
        if(daoBiddingShares[activeUserIndex[i]] > 0) {
            supportCount++;
        }
    }
    
    return (supportCount * 1000000 / activeUserCount) >= 666666;
}


    // Settle temporary bids with remaining allocation
    function settleTemporaryBids(uint256 dailyMarketPortion) internal {
        uint256 remainingAllocation = dailyMarketPortion;

        // Get all temporary bids and sort by price (would need sorting implementation)
        BidInfo[] memory allBids = getAllTemporaryBids();
        sortBidsByPrice(allBids);

        for(uint256 i = 0; i < allBids.length && remainingAllocation > 0; i++) {
            uint256 settleAmount = allBids[i].amount < remainingAllocation ? allBids[i].amount : remainingAllocation;
            address dao = getBidDao(allBids[i]); // Would need to implement this

            if(settleAmount > 0) {
                remainingAllocation -= settleAmount;
                // Transfer tokens at bid price
                _transfer(address(this), dao, settleAmount);
                emit BidSettled(dao, false, settleAmount, allBids[i].price);
            }
        }
    }

    // Calculate final settlement price for the day
    function calculateSettlementPrice() internal view returns (uint256) {
        uint256 totalValue = 0;
        uint256 totalVolume = 0;

        // Use activeDaoList directly
        for(uint256 i = 0; i < activeDaoList.length; i++) {
            address dao = activeDaoList[i];
            BidInfo[] storage bids = permanentBids[dao];

            for(uint256 j = 0; j < bids.length; j++) {
                if(bids[j].isSettled) {
                    totalValue += bids[j].amount * bids[j].price;
                    totalVolume += bids[j].amount;
                }
            }
        }

        if(totalVolume == 0) return currentDailyPrice;
        return totalValue / totalVolume;
    }

    event BidSettled(address indexed dao, bool indexed isPermanent, uint256 amount, uint256 price);

    event UserStatusChanged(address indexed user, bool indexed isActive, uint256 timestamp);

    event PriceUpdated(uint256 newPrice);
    event DailySettlementCompleted(uint256 settlementPrice, uint256 totalVolume);
    event DailyAllocationUpdated(uint256 allocation);
    
    struct MarketplaceListing {
        uint256 id;
        uint256 teamId;
        uint256 daoId;
        uint256 price;
        bool approved;
        bool active;
    }

    struct BidInfo {
        uint256 amount;
        uint256 price;
        uint256 timestamp;
        bool isSettled;
    }

    struct AnonymousTransaction {
        bytes32 publicKeyHash;    // Hash of off-chain public key
        address recipient;
        uint256 amount;
        uint256 creationTime;
        bool claimed;
        bytes32 conditionHash;
    }

    // State variables
    address public daoAddress;
    mapping(uint256 => Team) public teams;
    mapping(uint256 => MarketplaceListing) public listings;
    uint256 public teamCount;
    uint256 public listingCount;
    mapping(address => uint256) public userTeams;
    mapping(address => uint256) public lastActivity;
    mapping(bytes32 => AnonymousTransaction) public anonymousTransactions;

    // Activity and distribution tracking
    mapping(address => uint256) public lastDistribution;
    mapping(address => bool) public isActiveUser;
    mapping(address => uint256) public contributionCeiling;
    uint256 public activeUserCount;
    uint256 public lastUserBaseCalculation;
    uint256 public dailyAllocation;

constructor() ERC20("Participation Incentive Token Architecture", "PITA") ReentrancyGuard() {
    _mint(address(this), ANNUAL_SUPPLY); // Changed from minting to msg.sender to minting to contract
    treasuryBalance = ANNUAL_SUPPLY;      // Add this line to track treasury
    lastAnnualMint = block.timestamp;
    currentDailyPrice = 1e18; 
    lastDailyPrice = 1e18;
    dailyAllocation = DAILY_SUPPLY;       // Add this line to initialize allocation
}
function initializeAdmin() external {
    require(activeUserCount == 0, "Already initialized");
    activeDaoList.push(msg.sender);
    daoPosInList[msg.sender] = 0;
    isDaoMember[msg.sender] = true;
    daoBiddingShares[msg.sender] = 1;
    isActiveUser[msg.sender] = true;
    activeUserIndex[0] = msg.sender;
    activeUserPosition[msg.sender] = 0;
    activeUserCount = 1;
    emit UserStatusChanged(msg.sender, true, block.timestamp);
}
    
    // Add annual minting function
function performAnnualMint() external onlyDAO {
    require(block.timestamp >= lastAnnualMint + 31557625 seconds, "Too early");
    require(totalSupply() + ANNUAL_SUPPLY <= 1000000000000000, "Supply cap reached");
    
    uint256 neededSupply = activeUserCount == 0 ? 
        ANNUAL_SUPPLY : // During initialization
        7407407407 * activeUserCount * 3; // Normal operation
        
    if (treasuryBalance < neededSupply) {
        _mint(address(this), ANNUAL_SUPPLY);
        treasuryBalance += ANNUAL_SUPPLY;  // Add this line
        lastAnnualMint = block.timestamp;
    }
}

    // Add bidding functions
    /*function placePermanentBid(uint256 amount, uint256 price) external {
        require(isDaoMember[msg.sender], "Not DAO member");
        require(amount >= dailyAllocation / 1000, "Bid too small"); // 0.1% minimum
        require(amount <= getDaoLimit(msg.sender) * 25 / 100, "Exceeds 25% limit");

        // Check DAO's total bids don't exceed their share
        uint256 totalDaoBids = getTotalDaoBids(msg.sender);
        require(totalDaoBids + amount <= getDaoLimit(msg.sender), "Exceeds DAO limit");

        permanentBids[msg.sender].push(BidInfo({
            amount: amount,
            price: price,
            timestamp: block.timestamp,
            isPermanent: true,
            isSettled: false
        }));
    }

    function placeTemporaryBid(uint256 amount, uint256 price) external {
        require(isDaoMember[msg.sender], "Not DAO member");
        uint256 daoLimit = getDaoLimit(msg.sender);
        require(amount <= daoLimit * 3, "Exceeds 3x limit");

        temporaryBids[msg.sender].push(BidInfo({
            amount: amount,
            price: price,
            timestamp: block.timestamp,
            isPermanent: false,
            isSettled: false
        }));
    }*/

    function placeBid(uint256 amount, uint256 price, bool isPermanent) external {
        require(isDaoMember[msg.sender], "Not DAO member");
        uint256 daoLimit = getDaoLimit(msg.sender);
        
        if(isPermanent) {
            require(amount >= dailyAllocation / 1000, "Bid too small");
            require(amount <= daoLimit * 25 / 100, "Exceeds 25% limit");
            require(getTotalDaoBids(msg.sender) + amount <= daoLimit, "Exceeds DAO limit");
            
            // Calculate PLS value and add to contribution ceiling
            uint256 plsValue = amount * price / 1e18;  // Assuming price is in PLS with 18 decimals
            contributionCeiling[msg.sender] += plsValue;

            permanentBids[msg.sender].push(BidInfo({
                amount: amount,
                price: price,
                timestamp: block.timestamp,
                isSettled: false
            }));
        } else {
            temporaryBids[msg.sender].push(BidInfo({
                amount: amount,
                price: price,
                timestamp: block.timestamp,
                isSettled: false
            }));
        }
    }

    function getTotalSettledVolume() internal view returns (uint256) {
        uint256 totalVolume = 0;
        
        // Use activeDaoList directly
        for(uint256 i = 0; i < activeDaoList.length; i++) {
            address dao = activeDaoList[i];
            BidInfo[] storage bids = permanentBids[dao];
            for(uint256 j = 0; j < bids.length; j++) {
                if(bids[j].isSettled) {
                    totalVolume += bids[j].amount;
                }
            }
        }
        return totalVolume;
    }
    
    // Daily settlement function
    function settleDailyBids() internal onlyDAO {
        require(block.timestamp % 86400 <= 3600, "Outside settlement window");

        uint256 dailyMarketPortion = (dailyAllocation * 7407407407) / 100000000000; // market_portion 74

        // Settle permanent bids first
        settlePermanentBids(dailyMarketPortion);

        // Then settle temporary bids with remaining allocation
        settleTemporaryBids(dailyMarketPortion);

        // Update price metrics
        uint256 newPrice = calculateSettlementPrice();
        uint256 totalVolume = getTotalSettledVolume(); // New function needed
        updateDailyPrice(newPrice);
        emit DailySettlementCompleted(newPrice, totalVolume);
    }

    // Helper functions
    function getDaoLimit(address dao) public view returns (uint256) {
        uint256 networkShare = daoBiddingShares[dao];
        require(networkShare >= 1, "Below 1% minimum");
        return dailyAllocation * networkShare / 100;
    }

    
    function setDAOAddress(address _daoAddress) external {
        //require(daoAddress == address(0), "DAO already set");
        require(_daoAddress != address(0), "Invalid DAO address");
        daoAddress = _daoAddress;
    }

    /*modifier onlyDAO() {
        require(msg.sender == daoAddress, "Only DAO can call");
        _;
    }*/

    // User activity and token distribution
    function recordActivity(address user) public onlyDAO {
        if (!isActiveUser[user]) {
            isActiveUser[user] = true;
            activeUserIndex[activeUserCount] = user;
            activeUserPosition[user] = activeUserCount;
            activeUserCount++;
            emit UserStatusChanged(user, true, block.timestamp);
        }
        lastActivity[user] = block.timestamp;
    }

    // Daily token allocation and distribution
    function calculateDailyAllocation() external onlyDAO {
        require(block.timestamp >= lastUserBaseCalculation + 1 days, "Too early");

        if (block.timestamp >= lastUserBaseCalculation + 2 weeks) {
            resetInactiveUsers();
        }

        uint256 priceAdjustmentFactor = 1e18; // Default 1.0 in fixed point

        // Keep existing price adjustment calculation as it's needed for stability
        if (lastDailyPrice > 0 && currentDailyPrice > 0) {
            uint256 targetDeflation = 1e18; // 1.0 in fixed point (0% change)
            uint256 priceRatio = (currentDailyPrice * 1e18) / lastDailyPrice;

            if (priceRatio < targetDeflation) {
                priceAdjustmentFactor = (priceRatio * priceRatio) / 1e18;
            } else {
                priceAdjustmentFactor = priceRatio;
            }
        }

        // Calculate base distribution using fixed per-user amount
        uint256 perUserAmount = (7407407407 * priceAdjustmentFactor) / 1e18; // per user base 74
        uint256 baseAllocation = perUserAmount * activeUserCount;

        // Calculate market portion
        uint256 marketPortion = (baseAllocation * 7407407407) / 100000000000; // market_portion 74
        uint256 adjustedDailySupply = baseAllocation + marketPortion;

        // Handle unused supply
        if (adjustedDailySupply < DAILY_SUPPLY) {
            uint256 unusedSupply = DAILY_SUPPLY - adjustedDailySupply;
            treasuryBalance += unusedSupply;
        }

        // Update price tracking
        lastDailyPrice = currentDailyPrice;

        // Distribute tokens
        _distributeTokens(perUserAmount);

        dailyAllocation = adjustedDailySupply;
        emit DailyAllocationUpdated(dailyAllocation);
        settleDailyBids();
        
        lastUserBaseCalculation = block.timestamp;
    }

    function withdrawTreasury() external onlyDAO {
        uint256 neededSupply = (dailyAllocation * activeUserCount);
        uint256 availableSupply = totalSupply() - treasuryBalance;
        require(availableSupply < neededSupply, "Sufficient supply exists");
        uint256 withdrawAmount = neededSupply - availableSupply;
        require(withdrawAmount <= treasuryBalance, "Insufficient treasury");
        treasuryBalance -= withdrawAmount;
        _mint(daoAddress, withdrawAmount);
    }

    // Replace price check in updateDailyPrice:
    function updateDailyPrice(uint256 newPrice) internal onlyDAO {
        require(newPrice > 0, "Invalid price");
        if(lastDailyPrice > 0) {
            uint256 changePercent = ((newPrice > lastDailyPrice ? 
                newPrice - lastDailyPrice : 
                lastDailyPrice - newPrice) * 1000000) / lastDailyPrice;
            require(changePercent <= 9200, "Price change too large");
        }
        lastDailyPrice = currentDailyPrice;
        currentDailyPrice = newPrice;
        emit PriceUpdated(newPrice);
    }
    
    
    // Value creation and marketplace functions
    function createTeam() external returns (uint256) {
        require(userTeams[msg.sender] == 0, "Already in team");
        teamCount++;
        //uint256 teamId = teamCount;

        teams[teamCount] = Team({
            id: teamCount,
            members: new address[](0),
            valueCreated: 0,
            lastActivityTimestamp: block.timestamp,
            active: true
        });

        teams[teamCount].members.push(msg.sender);
        userTeams[msg.sender] = teamCount;
        return teamCount;
    }

    function createMarketplaceListing(
        uint256 teamId,
        uint256 daoId,
        uint256 price
    ) external returns (uint256) {
        require(teams[teamId].active, "Team inactive");
        require(userTeams[msg.sender] == teamId, "Not team member");

        listingCount++;
        //uint256 listingId = listingCount;
        listings[listingCount] = MarketplaceListing({
            id: listingCount,
            teamId: teamId,
            daoId: daoId,
            price: price,
            approved: false,
            active: true
        });

        return listingCount;
    }

    // Anonymous transaction system
    function createAnonymousTransaction(
        bytes32 publicKeyHash,
        address recipient,
        uint256 amount,
        bytes32 conditionHash
    ) external returns (bytes32) {
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");

        bytes32 txHash = keccak256(abi.encodePacked(
            publicKeyHash,
            recipient,
            amount,
            block.timestamp
        ));

        anonymousTransactions[txHash] = AnonymousTransaction({
            publicKeyHash: publicKeyHash,
            recipient: recipient,
            amount: amount,
            creationTime: block.timestamp,
            claimed: false,
            conditionHash: conditionHash
        });

        _transfer(msg.sender, address(this), amount);
        return txHash;
    }

    function verifyTransactionClaim(
        bytes32 txHash,
        bytes calldata signature,
        bytes calldata condition
    ) public view returns (bool) {
        AnonymousTransaction storage txData = anonymousTransactions[txHash];
        if (txData.conditionHash != bytes32(0) && keccak256(condition) != txData.conditionHash) return false;
        bytes32 messageHash = keccak256(abi.encodePacked(txHash, condition));
        return keccak256(abi.encodePacked(messageHash.recover(signature))) == txData.publicKeyHash;
    }

    function claimAnonymousTransaction(
        bytes32 txHash,
        bytes calldata signature,
        bytes calldata condition
    ) external {
        require(verifyTransactionClaim(txHash, signature, condition), "Invalid claim");
        AnonymousTransaction storage txData = anonymousTransactions[txHash];
        require(!txData.claimed, "Already claimed");
        require(block.timestamp <= txData.creationTime + (108 * 24 * 60 * 60), "Expired");
        require(msg.sender == txData.recipient, "Not recipient");

        txData.claimed = true;
        _transfer(address(this), txData.recipient, txData.amount);
    }

    // Internal helper functions
    function resetInactiveUsers() internal {
        for (uint256 i = 0; i < activeUserCount;) {
            address user = activeUserIndex[i];
            if (lastActivity[user] < block.timestamp - 2 weeks) {
                // Move last user to this position
                uint256 lastIndex = activeUserCount - 1;
                address lastUser = activeUserIndex[lastIndex];

                activeUserIndex[i] = lastUser;
                activeUserPosition[lastUser] = i;

                delete activeUserIndex[lastIndex];
                delete activeUserPosition[user];

                isActiveUser[user] = false;
                activeUserCount--;

                emit UserStatusChanged(user, false, block.timestamp);
                // Don't increment i since we moved a new user to this position
            } else {
                i++;
            }
        }
        lastUserBaseCalculation = block.timestamp;
    }

    // Modified version without getActiveUserAtIndex
    function _distributeTokens(uint256 amount) internal {
        for (uint256 i = 0; i < activeUserCount; i++) {
            address user = activeUserIndex[i];
            if (isActiveUser[user]) {
                _mint(user, amount);
                lastDistribution[user] = block.timestamp;
            }
        }
    }
}

// This interface would be used by the ModularDAOMini contract
interface IDAOToken {
    function recordActivity(address user) external;
    function calculateDailyAllocation() external;
}