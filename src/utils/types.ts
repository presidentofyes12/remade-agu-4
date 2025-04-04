export enum ProposalStatus {
  Pending = 0,
  Active = 1,
  Canceled = 2,
  Defeated = 3,
  Succeeded = 4,
  Queued = 5,
  Expired = 6,
  Executed = 7
}

export interface Proposal {
  id: number;
  description: string;
  category: number;
  proposer: `0x${string}`;
  startBlock: bigint;
  endBlock: bigint;
  state: number;
}

export interface ProposalVotes {
  forVotes: bigint;
  againstVotes: bigint;
  abstainVotes: bigint;
}

export interface VoteReceipt {
  hasVoted: boolean;
  support: boolean;
  votes: bigint;
} 