import { useAccount, useContractRead, useContractWrite } from 'wagmi'
import { readContract } from 'wagmi/actions' // Import readContract for one-off reads
import { config } from '../config/wagmi' // Import wagmi config
import { CoreContracts } from '../contracts/deployments' // Removed ContractConfig import
import { useState } from 'react'
import { keccak256, toBytes, Abi } from 'viem' // Import hashing utilities
import { MathematicalValidator } from '../utils/validator'
import { ConceptMapper } from '../utils/conceptMapper'
import { computeTripartiteValue } from '../utils/math'

// Define ABI types for contract interactions
type DAOTokenABI = typeof CoreContracts.DAOToken.abi
type ViewConstituentABI = typeof CoreContracts.ViewConstituent.abi
type LogicConstituentABI = typeof CoreContracts.LogicConstituent.abi

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

interface ProposalActions {
  targets: `0x${string}`[]
  values: bigint[]
  calldatas: `0x${string}`[]
}

// Helper function to correctly hash the description string using keccak256
function hashDescription(description: string): `0x${string}` {
  return keccak256(toBytes(description));
}

// Define a more specific type for proposal data coming from the contract read
interface RawProposalData {
  id: bigint; // Assuming ID is bigint from contract
  description: string;
  category: number;
  proposer: `0x${string}`;
  startBlock: bigint;
  endBlock: bigint;
  state: number;
  // Add other fields returned by getProposals if necessary
}

export function useGovernance() {
  const { address } = useAccount()
  // Separate loading/error states for different actions might be beneficial
  const [isSubmitting, setIsSubmitting] = useState(false) 
  const [isVoting, setIsVoting] = useState(false)
  const [isDelegating, setIsDelegating] = useState(false)
  const [isQueuing, setIsQueuing] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [error, setError] = useState<string | null>(null) // General error state
  const [conceptMapper] = useState(() => new ConceptMapper())

  // --- Contract Reads (Keep as they are) ---
  const { data: votingPower } = useContractRead({
    address: CoreContracts.DAOToken.address,
    abi: CoreContracts.DAOToken.abi as unknown as Abi,
    functionName: 'getVotes',
    args: [address],
  })

  const { data: proposalCount } = useContractRead({
    address: CoreContracts.ViewConstituent.address,
    abi: CoreContracts.ViewConstituent.abi as unknown as Abi,
    functionName: 'getProposalCount',
  })

  // Read proposals (consider pagination for large numbers)
  const { data: proposalsData = [], isLoading: isLoadingProposals } = useContractRead({
    address: CoreContracts.ViewConstituent.address,
    abi: CoreContracts.ViewConstituent.abi as unknown as Abi,
    functionName: 'getProposals',
    args: [0, proposalCount ? Number(proposalCount) : 10],
  })

  // Map proposal data with proper typing
  const proposals = (proposalsData as RawProposalData[]).map((p) => ({ 
      ...p,
      id: Number(p.id), // Convert bigint id to number for easier use in UI
      status: ProposalStatus[p.state] ?? 'Unknown' // Assuming state is the numeric status
  }));

  // --- Write Hook (Initialize once) ---
  const { writeContractAsync } = useContractWrite()

  // --- Action Functions ---
  const submitProposal = async (description: string, category: number): Promise<`0x${string}` | undefined> => {
    if (!address) { setError('Please connect your wallet'); return }

    // Validate the category using concept mapping
    const categoryValue = BigInt(category)
    const categoryValidation = await conceptMapper.getValueWithMeaning(categoryValue)
    if (!categoryValidation.label) {
      setError('Invalid proposal category')
      return
    }

    setIsSubmitting(true)
    setError(null)
    try {
      const tx = await writeContractAsync({
        address: CoreContracts.LogicConstituent.address,
        abi: CoreContracts.LogicConstituent.abi as unknown as Abi,
        functionName: 'propose',
        args: [description, category],
      })
      return tx
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create proposal'
      console.error("Proposal Submission Error:", err); 
      setError(message)
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }

  const vote = async (proposalId: number, support: boolean): Promise<`0x${string}` | undefined> => {
    if (!address) { setError('Please connect your wallet'); return }

    // Validate voting power using mathematical consistency
    const currentVotingPower = votingPower ? BigInt(votingPower.toString()) : 0n
    const validation = await MathematicalValidator.validateOperation(
      currentVotingPower,
      'getVotes',
      [address]
    )

    if (!validation.isValid) {
      setError('Voting power validation failed')
      return
    }

    setIsVoting(true)
    setError(null)
    try {
      const tx = await writeContractAsync({
        address: CoreContracts.LogicConstituent.address,
        abi: CoreContracts.LogicConstituent.abi as unknown as Abi,
        functionName: 'castVote',
        args: [BigInt(proposalId), support],
      })
      return tx
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to cast vote'
      console.error("Vote Casting Error:", err);
      setError(message)
      throw err
    } finally {
      setIsVoting(false)
    }
  }

  const delegateVotes = async (delegatee: `0x${string}`): Promise<`0x${string}` | undefined> => {
    if (!address) { setError('Please connect your wallet'); return }

    // Validate current voting power before delegation
    const currentVotingPower = votingPower ? BigInt(votingPower.toString()) : 0n
    const validation = await MathematicalValidator.validateOperation(
      currentVotingPower,
      'getVotes',
      [address]
    )

    if (!validation.isValid) {
      setError('Voting power validation failed')
      return
    }

    setIsDelegating(true)
    setError(null)
    try {
      const tx = await writeContractAsync({
        address: CoreContracts.DAOToken.address,
        abi: CoreContracts.DAOToken.abi as unknown as Abi,
        functionName: 'delegate',
        args: [delegatee],
      })
      return tx
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delegate votes'
      console.error("Delegation Error:", err);
      setError(message)
      throw err
    } finally {
      setIsDelegating(false)
    }
  }

  // Get proposal actions from the contract
  const getProposalActions = async (proposalId: number): Promise<ProposalActions> => {
    try {
      const actions = await readContract(config, {
        address: CoreContracts.ViewConstituent.address,
        abi: CoreContracts.ViewConstituent.abi as unknown as Abi,
        functionName: 'getProposalActions',
        args: [BigInt(proposalId)],
      })

      if (!actions || !Array.isArray(actions) || actions.length !== 3) {
        throw new Error('Invalid proposal actions format')
      }

      return {
        targets: actions[0] as `0x${string}`[],
        values: actions[1] as bigint[],
        calldatas: actions[2] as `0x${string}`[],
      }
    } catch (err) {
      console.error('Error getting proposal actions:', err)
      throw err
    }
  }

  // --- Queue and Execute --- 
  // IMPORTANT: These require the proposal's actions (targets, values, calldatas)
  // You need a way to fetch/construct these based on the proposalId or description.
  // The `propose` function in your contract likely stores this info, 
  // or proposals might follow a standard structure.

  const queueProposal = async (proposalId: number, description: string): Promise<`0x${string}` | undefined> => {
    if (!address) { setError('Please connect your wallet'); return }
    
    try {
      const actions = await getProposalActions(proposalId)
      const descriptionHash = hashDescription(description)

      // Validate the proposal state before queuing
      const stateValidation = await MathematicalValidator.validateTransaction(
        'state',
        [BigInt(proposalId)],
        CoreContracts.ViewConstituent,
        BigInt(ProposalStatus.Succeeded)
      )

      if (!stateValidation.isValid) {
        setError('Proposal is not in a state that can be queued')
        return
      }

      setIsQueuing(true)
      setError(null)

      const tx = await writeContractAsync({
        address: CoreContracts.LogicConstituent.address,
        abi: CoreContracts.LogicConstituent.abi as unknown as Abi,
        functionName: 'queue',
        args: [actions.targets, actions.values, actions.calldatas, descriptionHash],
      })
      return tx
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to queue proposal'
      console.error("Queue Error:", err);
      setError(message)
      throw err
    } finally {
      setIsQueuing(false)
    }
  }

  const executeProposal = async (proposalId: number, description: string): Promise<`0x${string}` | undefined> => {
    if (!address) { setError('Please connect your wallet'); return }

    try {
      const actions = await getProposalActions(proposalId)
      const descriptionHash = hashDescription(description)

      // Validate the proposal state before executing
      const stateValidation = await MathematicalValidator.validateTransaction(
        'state',
        [BigInt(proposalId)],
        CoreContracts.ViewConstituent,
        BigInt(ProposalStatus.Queued)
      )

      if (!stateValidation.isValid) {
        setError('Proposal is not in a state that can be executed')
        return
      }

      setIsExecuting(true)
      setError(null)

      const tx = await writeContractAsync({
        address: CoreContracts.LogicConstituent.address,
        abi: CoreContracts.LogicConstituent.abi as unknown as Abi,
        functionName: 'execute',
        args: [actions.targets, actions.values, actions.calldatas, descriptionHash],
      })
      return tx
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to execute proposal'
      console.error("Execute Error:", err);
      setError(message)
      throw err
    } finally {
      setIsExecuting(false)
    }
  }

  // --- State Reading --- 
  const getProposalState = async (proposalId: number): Promise<string> => {
    if (proposalId === undefined || proposalId === null) return 'Invalid ID';
    try {
      const stateResult = await readContract(config, {
        address: CoreContracts.ViewConstituent.address,
        abi: CoreContracts.ViewConstituent.abi as unknown as Abi,
        functionName: 'state',
        args: [BigInt(proposalId)],
      })
      
      const state = Number(stateResult);

      if (typeof state === 'number' && ProposalStatus[state] !== undefined) {
        return ProposalStatus[state];
      } else {
          console.warn(`Invalid or unknown state received for proposal ${proposalId}:`, stateResult);
          return 'Unknown';
      }
    } catch (err) {
      console.error(`Error getting proposal state for ID ${proposalId}:`, err)
      return 'Error'
    }
  }

  return {
    votingPower,
    proposals,
    isLoadingProposals, // Expose proposal loading state
    submitProposal,
    isSubmitting,     // Expose action-specific loading states
    vote,
    isVoting,
    delegateVotes,
    isDelegating,
    queueProposal,
    isQueuing,
    executeProposal,
    isExecuting,
    getProposalState, // Keep this for manual status checks if needed
    error,            // Expose general error
  }
} 