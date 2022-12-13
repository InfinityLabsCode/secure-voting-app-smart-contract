// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Ballot {
    //The walletAddress that deployed the smart contract
    address public chairPerson;
    string public electionName;
    string public electionDescription;
    bool public votingEnded;

    //Custom Type to represent single voter
    struct Voter {
        uint256 weight; // weight is accumulated by delegation
        address delegate; //The persone delegated to vote
        uint256 voteFor; //Index of the voted proposal
        bool voted; //Whether voter already voted or not
    }

    //Custom Type to represent one proposal
    struct Proposal {
        string name; //The name of the proposal
        uint256 voteCount; //Total vote accumalted for this proposal
    }

    //Winning proposal
    Proposal public winnerProposal;
    uint256 public winningProposalIndex;

    //Map of voters
    mapping(address => Voter) voters;

    //List of proposals
    Proposal[] public proposals;

    constructor(
        address _owner,
        string memory _electionName,
        string memory _electionDescription,
        string[] memory _proposalsName
    ) {
        electionName = _electionName;
        electionDescription = _electionDescription;
        chairPerson = _owner;
        voters[chairPerson].weight = 1;
        votingEnded = false;

        //Initiate All the proposals
        initateProposals(_proposalsName);
    }

    function initateProposals(string[] memory _proposalsName) public {
        for (uint256 i = 0; i < _proposalsName.length; i++) {
            proposals.push(Proposal({name: _proposalsName[i], voteCount: 0}));
        }
    }

    function _giveRightToVote(address _voter) public {
        require(
            msg.sender == chairPerson,
            "Only chairperson can give right to vote."
        );
        require(!voters[_voter].voted, "The voter already voted.");
        require(voters[_voter].weight == 0);
        voters[_voter].weight = 1;
    }

    function _giveVote(uint256 _proposal, address _voterAddress) public {
        Voter storage sender = voters[_voterAddress];
        require(sender.weight != 0, "Has no right to vote");
        require(!sender.voted, "Already voted.");
        sender.voted = true;
        sender.voteFor = _proposal;

        // If `proposal` is out of the range of the array,
        // this will throw automatically and revert all
        // changes.
        proposals[_proposal].voteCount += sender.weight;
    }

    function _winningProposal() public view returns (uint256 winningProposal_) {
        require(votingEnded, "Votting is still processing");
        uint256 winningVoteCount = 0;
        for (uint256 p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount;
                winningProposal_ = p;
            }
        }
    }

    function _endingVoting(address _sender) external {
        require(
            _sender == chairPerson,
            "Only Chiarpersone can end the voting session!"
        );
        votingEnded = true;
        winningProposalIndex = _winningProposal();
        winnerProposal = proposals[winningProposalIndex];
    }
}
