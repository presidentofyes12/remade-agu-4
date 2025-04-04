// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ConceptValues.sol";

contract ConceptMapping {
    ConceptValues private conceptValues;

    constructor(address conceptValuesAddress) {
        conceptValues = ConceptValues(conceptValuesAddress);
    }

    struct ConceptDefinition {
        string label;           // User-defined meaning/label for this value
        string description;     // Optional detailed description
        address owner;          // Who can edit this definition
        uint256 lastUpdated;   // When this definition was last updated
    }

    // Maps the numerical values to their user-defined meanings
    mapping(int256 => ConceptDefinition) private conceptDefinitions;
    
    // Event emitted when a concept definition is updated
    event ConceptDefined(
        int256 indexed value,
        string label,
        string description,
        address indexed owner
    );
    
    // Event emitted when concept ownership is transferred
    event ConceptOwnershipTransferred(
        int256 indexed value,
        address indexed previousOwner,
        address indexed newOwner
    );

    modifier onlyConceptOwner(int256 value) {
        require(
            conceptDefinitions[value].owner == address(0) || 
            conceptDefinitions[value].owner == msg.sender,
            "Not authorized to modify this concept"
        );
        _;
    }

    // Define or update the meaning for a specific value
    function defineConceptMeaning(
        int256 value,
        string memory label,
        string memory description
    ) public onlyConceptOwner(value) {
        require(conceptValues.isValidConceptValue(value), "Invalid concept value");
        conceptDefinitions[value] = ConceptDefinition({
            label: label,
            description: description,
            owner: msg.sender,
            lastUpdated: block.timestamp
        });
        
        emit ConceptDefined(value, label, description, msg.sender);
    }

    // Define meanings for multiple values at once
    function defineBulkConcepts(
        int256[] memory values,
        string[] memory labels,
        string[] memory descriptions
    ) public {
        require(
            values.length == labels.length && 
            values.length == descriptions.length,
            "Array lengths must match"
        );
        
        for (uint i = 0; i < values.length; i++) {
            require(conceptValues.isValidConceptValue(values[i]), "Invalid concept value");
            if (conceptDefinitions[values[i]].owner == address(0) ||
                conceptDefinitions[values[i]].owner == msg.sender) {
                defineConceptMeaning(values[i], labels[i], descriptions[i]);
            }
        }
    }
    
    // Get the current definition for a value
    function getConceptMeaning(int256 value) public view returns (
        string memory label,
        string memory description,
        address owner,
        uint256 lastUpdated
    ) {
        ConceptDefinition memory def = conceptDefinitions[value];
        return (def.label, def.description, def.owner, def.lastUpdated);
    }
    
    // Transfer ownership of a concept's definition to another address
    function transferConceptOwnership(int256 value, address newOwner) public onlyConceptOwner(value) {
        require(newOwner != address(0), "Cannot transfer to zero address");
        address previousOwner = conceptDefinitions[value].owner;
        conceptDefinitions[value].owner = newOwner;
        
        emit ConceptOwnershipTransferred(value, previousOwner, newOwner);
    }

    // Check if a value has been defined
    function isConceptDefined(int256 value) public view returns (bool) {
        return bytes(conceptDefinitions[value].label).length > 0;
    }

    // Get the owner of a concept definition
    function getConceptOwner(int256 value) public view returns (address) {
        return conceptDefinitions[value].owner;
    }
}
