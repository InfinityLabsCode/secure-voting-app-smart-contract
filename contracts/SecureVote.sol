// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Ballot.sol";

/// @title SecureVote: Core function for developing multiple Ballot/Election smart contract
/// @author InfinityLabsCode
/// @notice This smart contract contains all functionality for developing SecureVote smart contract

contract SecureVote is Ownable {
    ///@dev Array of Ballots
    Ballot[] BallotArray;

    ///@dev structure of SingleElectionStatistics for showing statistics
    struct SingleElectionStatistics {
        ///@dev name for the election
        string name;
        ///@dev description for the election
        string description;
        ///@dev vote counted for the election
        uint256 voteCounted;
        ///@dev voting status
        bool voteEnded;
        ///@dev name of the winning proposal
        string winningProposalName;
    }

    ///@dev create new election by the chairperson
    ///@param _electionName name of the election
    ///@param  _electionDescription description of the election
    ///@param _proposalsName list of proposals name
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

    ///@dev call the specific election _giveRightToVote method
    ///@param _index index of the election
    ///@param  _voter the address of the voter
    function giveRightToVote(uint256 _index, address _voter) public {
        BallotArray[_index]._giveRightToVote(msg.sender, _voter);
    }

    ///@dev call the specific election giveVote method
    ///@param _index index of the election
    ///@param  _proposal the proposal voted for
    function giveVote(uint256 _index, uint256 _proposal) public {
        BallotArray[_index]._giveVote(_proposal, msg.sender);
    }

    ///@dev call the specific election _endingVoting method
    ///@param _index index of the election
    function endingVoting(uint256 _index) public {
        BallotArray[_index]._endingVoting(msg.sender);
    }

    ///@dev call the specific election _winningProposal method
    ///@return winningProposalIndex winning proposal index
    function winningProposal(uint256 _index) public view returns (uint256) {
        return BallotArray[_index]._winningProposal();
    }

    ///@dev making statistics for all ballot/election
    ///@return StatisticsArray with all the information of all election
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
