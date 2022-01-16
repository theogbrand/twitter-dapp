// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "hardhat/console.sol";


contract WavePortal {
    // properties
    uint256 totalWaves;
    uint256 private seed;

    // event used for logging history of waves 
    event NewWave(address indexed from, uint256 timestamp, string message);

    struct Wave {
        address waver; //address of user who waved
        string message; // message from user to be sent
        uint256 timestamp;
    }

    Wave[] waves;

    // associate address with last time user waved at us
    mapping(address => uint256) public lastWavedAt;

    // super() - can have super(stringVar), super(stringVar, intVar)
    // payable for allowing contract to pay people
    constructor() payable {
        console.log("Hello Smart World");
        seed = (block.timestamp + block.difficulty) % 100;
    }

    // public functions
    function wave(string memory _message) public {
        require(
            lastWavedAt[msg.sender] + 15 seconds < block.timestamp,
            "wait 15m"
        );

        lastWavedAt[msg.sender] = block.timestamp;

        totalWaves += 1;
        console.log("%s waved with message %s!", msg.sender, _message);

        waves.push(Wave(msg.sender, _message, block.timestamp));

        seed = (block.difficulty + block.timestamp + seed) % 100;

        console.log("Random # generated: %d", seed);

        if (seed <= 50) {
            console.log("%s won!", msg.sender);
            
            // each time sender waves, chance for sender to win prizeAmount
        // provided contract is funded sufficiently
            uint256 prizeAmount = 0.0001 ether;
            require(
                prizeAmount <= address(this).balance,
                "trying to withdraw more ethers than the contract currently has"
            );

            (bool success, ) = (msg.sender).call{value: prizeAmount}("");
            require(success, "Failed to withdraw ethers from contract");
        }
        
        // create solidity event whenever wave() is called
        emit NewWave(msg.sender, block.timestamp, _message);
    }

    function getAllWaves() public view returns (Wave[] memory) {
        return waves;
    }

    // func specifying return type
    function getTotalWaves() public view returns (uint256) {
        console.log("There is a total of %d waves!", totalWaves);
        return totalWaves;
    }
}