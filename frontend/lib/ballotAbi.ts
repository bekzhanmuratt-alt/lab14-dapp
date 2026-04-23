export const BALLOT_ABI = [
  "function chairperson() view returns (address)",
  "function giveRightToVote(address voter)",
  "function delegate(address to)",
  "function vote(uint256 proposal)",
  "function winningProposal() view returns (uint256)",
  "function winnerName() view returns (bytes32)",
  "function getProposal(uint256 index) view returns (bytes32 name, uint256 voteCount)",
  "function getProposalsCount() view returns (uint256)",
  "function getVoterStatus(address voter) view returns (uint256 weight, bool voted, address delegatedTo, uint256 votedProposal)",
  "event RightGranted(address indexed voter)",
  "event VoteDelegated(address indexed from, address indexed to)",
  "event Voted(address indexed voter, uint256 indexed proposal, uint256 weight)"
] as const;
