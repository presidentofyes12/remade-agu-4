// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IConstituent.sol";
import "./libraries/ProposalLib.sol";

contract ViewConstituent is IConstituent {
    using ProposalLib for ProposalLib.Proposal;

    function version() external pure returns (string memory) {
        return "1.0.0";
    }

    function getProposalState(address stateContract, uint256 proposalId) external view returns (
        ProposalLib.ProposalState,
        uint256 startEpoch,
        uint256 endEpoch,
        bool canceled,
        bool executed,
        uint256 forVotes,
        uint256 againstVotes,
        uint8 stage,
        uint256 proposerReputation
    ) {
        (bool success, bytes memory data) = stateContract.staticcall(
            abi.encodeWithSignature("getProposalBasicInfo(uint256)", proposalId)
        );
        require(success, "Failed to fetch proposal");
        
        (startEpoch, endEpoch, canceled, executed, forVotes, againstVotes, stage, proposerReputation) = 
            abi.decode(data, (uint256, uint256, bool, bool, uint256, uint256, uint8, uint256));
        
        (success, data) = stateContract.staticcall(
            abi.encodeWithSignature("currentEpoch()")
        );
        require(success, "Failed to fetch epoch");
        
        uint256 currentEpoch = abi.decode(data, (uint256));
        
        ProposalLib.ProposalState state;
        if (canceled) state = ProposalLib.ProposalState.Canceled;
        else if (executed) state = ProposalLib.ProposalState.Executed;
        else if (currentEpoch < startEpoch) state = ProposalLib.ProposalState.Pending;
        else if (currentEpoch >= startEpoch && currentEpoch <= endEpoch) state = ProposalLib.ProposalState.Active;
        else if (forVotes <= againstVotes) state = ProposalLib.ProposalState.Defeated;
        else if (currentEpoch > endEpoch) state = ProposalLib.ProposalState.Succeeded;
        else state = ProposalLib.ProposalState.Pending;
        
        return (state, startEpoch, endEpoch, canceled, executed, forVotes, againstVotes, stage, proposerReputation);
    }

    function getStakingInfo(address stateContract, address user) external view returns (uint256 balance, uint256 rewards) {
        (bool success, bytes memory data) = stateContract.staticcall(
            abi.encodeWithSignature("stakingBalances(address)", user)
        );
        require(success, "Failed to fetch staking balance");
        balance = abi.decode(data, (uint256));

        (success, data) = stateContract.staticcall(
            abi.encodeWithSignature("pendingRewards(address)", user)
        );
        require(success, "Failed to fetch rewards");
        rewards = abi.decode(data, (uint256));
    }

    function getUserReputation(address stateContract, address user) external view returns (uint256) {
        (bool success, bytes memory data) = stateContract.staticcall(
            abi.encodeWithSignature("reputationScores(address)", user)
        );
        require(success, "Failed to fetch reputation");
        return abi.decode(data, (uint256));
    }
    
    function getChironStreamStatus(address stateContract, uint256 locationId) external view returns (bool, uint256) {
        (bool success, bytes memory data) = stateContract.staticcall(
            abi.encodeWithSignature("streamActive(uint256)", locationId)
        );
        require(success, "Failed to fetch stream status");
        bool active = abi.decode(data, (bool));
        
        (success, data) = stateContract.staticcall(
            abi.encodeWithSignature("streamStartTime(uint256)", locationId)
        );
        require(success, "Failed to fetch stream time");
        uint256 startTime = abi.decode(data, (uint256));
        
        return (active, startTime);
    }
    
    function getReserveInfo(address stateContract, uint256 daoId) external view returns (uint256, uint256) {
        (bool success, bytes memory data) = stateContract.staticcall(
            abi.encodeWithSignature("reserveBalances(uint256)", daoId)
        );
        require(success, "Failed to fetch reserve balance");
        uint256 balance = abi.decode(data, (uint256));
        
        return (balance, 0);
    }
    
    function getAnalytics(address stateContract) external view returns (uint256, uint256, uint256, uint256) {
        (bool success, bytes memory data) = stateContract.staticcall(
            abi.encodeWithSignature("daoAnalytics()")
        );
        require(success, "Failed to fetch analytics");
        (uint256 transactions, uint256 users, uint256 votes, uint256 velocity) = 
            abi.decode(data, (uint256, uint256, uint256, uint256));
        return (transactions, users, votes, velocity);
    }

    function getLocationInfo(address stateContract, uint256 locationId) external view returns (bytes32, uint256, uint256) {
        (bool success, bytes memory data) = stateContract.staticcall(
            abi.encodeWithSignature("locations(uint256)", locationId)
        );
        require(success, "Failed to fetch location");
        (, bytes32 coordinates, uint256 memberCount, uint256 reputation) = 
            abi.decode(data, (uint256, bytes32, uint256, uint256));
        return (coordinates, memberCount, reputation);
    }

    function getMemberActivity(address stateContract, address member) external view returns (uint256) {
        (bool success, bytes memory data) = stateContract.staticcall(
            abi.encodeWithSignature("lastActivityTimestamp(address)", member)
        );
        require(success, "Failed to fetch activity");
        return abi.decode(data, (uint256));
    }

    function getDAOInfo(address stateContract, uint256 globalId) external view returns (uint256, uint256, bool) {
        (bool success, bytes memory data) = stateContract.staticcall(
            abi.encodeWithSignature("daos(uint256)", globalId)
        );
        require(success, "Failed to fetch DAO");
        (uint256 id, uint256 level, bool active) = abi.decode(data, (uint256, uint256, bool));
        return (id, level, active);
    }

    function getFeatureInfo(address stateContract, uint256 featureId) external view returns (bool, uint256, uint256) {
        (bool success, bytes memory data) = stateContract.staticcall(
            abi.encodeWithSignature("features(uint256)", featureId)
        );
        require(success, "Failed to fetch feature");
        (bool validated, uint256 successCount, uint256 testCount) = abi.decode(data, (bool, uint256, uint256));
        return (validated, successCount, testCount);
    }

    function getConnectionInfo(address stateContract, address user) external view returns (uint256, uint256, bool) {
        (bool success, bytes memory data) = stateContract.staticcall(
            abi.encodeWithSignature("connectionRewards(address)", user)
        );
        require(success, "Failed to fetch connection info");
        (uint256 currentConnections, uint256 connectionTarget, bool claimed) = abi.decode(data, (uint256, uint256, bool));
        return (currentConnections, connectionTarget, claimed);
    }

    function getMediaInfo(address stateContract, bytes32 contentHash) external view returns (bool, uint256, address) {
        (bool success, bytes memory data) = stateContract.staticcall(
            abi.encodeWithSignature("mediaContents(bytes32)", contentHash)
        );
        require(success, "Failed to fetch media info");
        (bool processed, uint256 timestamp, address uploader) = abi.decode(data, (bool, uint256, address));
        return (processed, timestamp, uploader);
    }

    function getChironSlotInfo(address stateContract, uint256 locationId, uint256 slotId) external view returns (uint256, uint256, bool) {
        (bool success, bytes memory data) = stateContract.staticcall(
            abi.encodeWithSignature("getChironSlotInfo(uint256,uint256)", locationId, slotId)
        );
        require(success, "Failed to fetch slot info");
        (uint256 durationMs, uint256 patternValue, bool isActive) = abi.decode(data, (uint256, uint256, bool));
        return (durationMs, patternValue, isActive);
    }

    function getLiquidityInfo(address stateContract, address user) external view returns (uint256, uint256) {
        (bool success, bytes memory data) = stateContract.staticcall(
            abi.encodeWithSignature("liquidityPool(address)", user)
        );
        require(success, "Failed to fetch liquidity info");
        (uint256 liquidity, uint256 rewards) = abi.decode(data, (uint256, uint256));
        return (liquidity, rewards);
    }
}

