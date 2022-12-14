// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Ballot.sol";

contract SecureVote is Ownable {
    //List of Voting occured
    Ballot[] BallotArray;

    //Statistics struct
    struct SingleElectionStatistics {
        string name;
        string description;
        uint256 voteCounted;
        bool voteEnded;
        string winningProposalName;
    }

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
        BallotArray[_index]._giveRightToVote(msg.sender,_voter);
    }

    function giveVote(uint256 _index, uint256 _proposal) public {
        BallotArray[_index]._giveVote(_proposal, msg.sender);
    }

    function endingVoting(uint256 _index) public {
        BallotArray[_index]._endingVoting(msg.sender);
    }

    function winningProposal(uint256 _index) public view returns (uint256) {
        return BallotArray[_index]._winningProposal();
    }

    function getStatisticsOfAllVote()
        public
        view
        returns (SingleElectionStatistics[] memory)
    {
        SingleElectionStatistics[]
            memory results = new SingleElectionStatistics[](BallotArray.length);

        for (uint256 i = 0; i < BallotArray.length; i++) {
            results[i] = SingleElectionStatistics({
                name: BallotArray[i]._getName(),
                description: BallotArray[i]._getDescription(),
                voteCounted: BallotArray[i]._getTotalVoteCounted(),
                voteEnded: BallotArray[i]._isVotingEnded(),
                winningProposalName: BallotArray[i]._getWinningProposalName()
            });
        }
        return results;
    }
}
