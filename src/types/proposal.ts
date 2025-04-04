export enum ProposalStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  CANCELED = 'CANCELED',
  FAILED = 'FAILED',
  PASSED = 'PASSED',
  QUEUED = 'QUEUED',
  EXPIRED = 'EXPIRED',
  EXECUTED = 'EXECUTED'
}

export enum VoteType {
  FOR = 'FOR',
  AGAINST = 'AGAINST',
  ABSTAIN = 'ABSTAIN'
}

export interface Vote {
  voter: string;
  type: VoteType;
  power: number; // Voting power used
  timestamp: number;
}

export interface Proposal {
  id: string;
  title: string;
  description: string;
  proposer: string;
  status: ProposalStatus;
  startTime: number;
  endTime: number;
  votes: {
    for: number;
    against: number;
    abstain: number;
  };
  votesDetail: Vote[];
  quorum: number; // Minimum participation required (percentage)
  executed?: boolean;
  executionData?: string; // Could be IPFS hash or contract call data
  createdAt: number;
}

// Mock data for development
export const mockProposals: Proposal[] = [
  {
    id: '1',
    title: 'Increase Funding for Research',
    description: 'Proposal to increase the budget allocation for AGU research initiatives by 20%',
    proposer: '0x1234567890123456789012345678901234567890',
    status: ProposalStatus.ACTIVE,
    startTime: Date.now(),
    endTime: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days from now
    votes: {
      for: 100,
      against: 20,
      abstain: 5
    },
    votesDetail: [],
    quorum: 51,
    createdAt: Date.now() - 24 * 60 * 60 * 1000 // Created 1 day ago
  },
  {
    id: '2',
    title: 'New Community Outreach Program',
    description: 'Establish a new program to engage with local communities and promote earth science education',
    proposer: '0x9876543210987654321098765432109876543210',
    status: ProposalStatus.PENDING,
    startTime: Date.now() + 24 * 60 * 60 * 1000, // Starts in 1 day
    endTime: Date.now() + 8 * 24 * 60 * 60 * 1000, // Ends in 8 days
    votes: {
      for: 0,
      against: 0,
      abstain: 0
    },
    votesDetail: [],
    quorum: 51,
    createdAt: Date.now() - 12 * 60 * 60 * 1000 // Created 12 hours ago
  }
]; 