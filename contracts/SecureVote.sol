// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Ballot.sol";

contract SecureVote is Ownable {
    //List of Voting occured
    Ballot[] BallotArray;

    //Create new election by the administrator
    function createNewElection(
        string memory _electionName,
        string memory _electionDescription,
        string[] memory _proposalsName
    ) public onlyOwner {
        Ballot ballot = new Ballot(
            msg.sender,
            _electionName,
            _electionDescription,
            _proposalsName
        );
        BallotArray.push(ballot);
    }

    function giveRightToVote(uint256 _index, address _voter) public {
        BallotArray[_index]._giveRightToVote(_voter);
    }

    function giveVote(uint256 _index, uint256 _proposal) public {
        BallotArray[_index]._giveVote(_proposal, msg.sender);
    }

    function edingVoting(uint256 _index) public {
        BallotArray[_index]._endingVoting(msg.sender);
    }

    function winningProposal(uint256 _index) public view returns (uint256) {
        return BallotArray[_index]._winningProposal();
    }
}
