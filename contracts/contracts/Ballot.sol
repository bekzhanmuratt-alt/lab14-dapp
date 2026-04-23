// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Ballot {
    struct Voter {
        uint256 weight;
        bool voted;
        address delegate;
        uint256 vote;
    }

    struct Proposal {
        bytes32 name;
        uint256 voteCount;
    }

    address public immutable chairperson;
    mapping(address => Voter) public voters;
    Proposal[] public proposals;

    event RightGranted(address indexed voter);
    event VoteDelegated(address indexed from, address indexed to);
    event Voted(address indexed voter, uint256 indexed proposal, uint256 weight);

    modifier onlyChairperson() {
        require(msg.sender == chairperson, "Only chairperson can call this function");
        _;
    }

    constructor(bytes32[] memory proposalNames) {
        require(proposalNames.length > 0, "At least one proposal is required");

        chairperson = msg.sender;
        voters[chairperson].weight = 1;

        for (uint256 i = 0; i < proposalNames.length; i++) {
            proposals.push(Proposal({name: proposalNames[i], voteCount: 0}));
        }
    }

    function giveRightToVote(address voter) external onlyChairperson {
        require(voter != address(0), "Zero address is not allowed");
        require(!voters[voter].voted, "The voter already voted");
        require(voters[voter].weight == 0, "Voting right already granted");

        voters[voter].weight = 1;
        emit RightGranted(voter);
    }

    function delegate(address to) external {
        Voter storage sender = voters[msg.sender];
        require(sender.weight > 0, "You have no right to vote");
        require(!sender.voted, "You already voted");
        require(to != msg.sender, "Self-delegation is disallowed");
        require(to != address(0), "Zero address is not allowed");

        while (voters[to].delegate != address(0)) {
            to = voters[to].delegate;
            require(to != msg.sender, "Found loop in delegation");
        }

        sender.voted = true;
        sender.delegate = to;

        Voter storage delegate_ = voters[to];
        if (delegate_.voted) {
            proposals[delegate_.vote].voteCount += sender.weight;
        } else {
            delegate_.weight += sender.weight;
        }

        emit VoteDelegated(msg.sender, to);
    }

    function vote(uint256 proposal) external {
        Voter storage sender = voters[msg.sender];
        require(sender.weight > 0, "You have no right to vote");
        require(!sender.voted, "Already voted");
        require(proposal < proposals.length, "Invalid proposal index");

        sender.voted = true;
        sender.vote = proposal;

        proposals[proposal].voteCount += sender.weight;
        emit Voted(msg.sender, proposal, sender.weight);
    }

    function winningProposal() public view returns (uint256 winningProposal_) {
        uint256 winningVoteCount = 0;
        for (uint256 p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount;
                winningProposal_ = p;
            }
        }
    }

    function winnerName() external view returns (bytes32 winnerName_) {
        winnerName_ = proposals[winningProposal()].name;
    }

    function getProposal(uint256 index) external view returns (bytes32 name, uint256 voteCount) {
        require(index < proposals.length, "Proposal does not exist");
        Proposal storage proposal = proposals[index];
        return (proposal.name, proposal.voteCount);
    }

    function getProposalsCount() external view returns (uint256) {
        return proposals.length;
    }

    function getVoterStatus(address voter)
        external
        view
        returns (uint256 weight, bool voted, address delegatedTo, uint256 votedProposal)
    {
        Voter storage v = voters[voter];
        return (v.weight, v.voted, v.delegate, v.vote);
    }
}
