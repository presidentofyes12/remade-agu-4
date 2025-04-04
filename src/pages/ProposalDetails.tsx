import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAccount, useContractRead, useWaitForTransactionReceipt } from 'wagmi'
import { useGovernance } from '../hooks/useGovernance'
import { ProposalStatus } from '@/utils/types'
import { Button } from '@/components/ui/button'
import { CoreContracts } from '../contracts/deployments'
import { toast } from 'sonner'
import { TransactionToast } from '../components/TransactionToast'
import { Abi } from 'viem'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card'

interface ProposalVotes {
  forVotes: bigint
  againstVotes: bigint
  abstainVotes: bigint
}

interface ProposalDetailsData {
  id: bigint
  description: string
  category: number
  proposer: `0x${string}`
  startBlock: bigint
  endBlock: bigint
  state: number
}

interface VoteReceipt {
    hasVoted: boolean;
    support: boolean;
    votes: bigint;
}

export default function ProposalDetails() {
  const { id: idString } = useParams<{ id: string }>()
  const id = idString ? Number(idString) : undefined;
  const { address } = useAccount();
  const {
     vote, getProposalState, votingPower, 
     queueProposal, executeProposal, 
     isVoting, isQueuing, isExecuting
  } = useGovernance()
  const [proposalStatus, setProposalStatus] = useState<string | null>(null)
  const [pendingTxHash, setPendingTxHash] = useState<`0x${string}` | undefined>(undefined);
  const [hasVoted, setHasVoted] = useState<boolean | null>(null);
  
  const [fullProposalData, setFullProposalData] = useState<ProposalDetailsData | null>(null);

  const { data: proposalData, isLoading: isLoadingProposal, refetch: refetchProposal } = useContractRead({
    address: CoreContracts.ViewConstituent.address,
    abi: CoreContracts.ViewConstituent.abi as unknown as Abi,
    functionName: 'getProposal',
    args: id !== undefined ? [BigInt(id)] : undefined,
  })

  useEffect(() => {
      if (proposalData) {
         setFullProposalData(proposalData as ProposalDetailsData); 
      }
  }, [proposalData]);

  const { data: proposalVotesData, isLoading: isLoadingVotes, refetch: refetchVotes } = useContractRead({
    address: CoreContracts.ViewConstituent.address,
    abi: CoreContracts.ViewConstituent.abi as unknown as Abi,
    functionName: 'getProposalVotes',
    args: id !== undefined ? [BigInt(id)] : undefined,
  })

  const proposalVotes = proposalVotesData as ProposalVotes | undefined;

  const { data: userVoteReceiptData, isLoading: isLoadingVoteReceipt, refetch: refetchReceipt } = useContractRead({
     address: CoreContracts.LogicConstituent.address,
     abi: CoreContracts.LogicConstituent.abi as unknown as Abi,
    functionName: 'getReceipt', 
    args: id !== undefined && address && proposalStatus === ProposalStatus[ProposalStatus.Active] ? [BigInt(id), address] : undefined,
  });

  useEffect(() => {
    if (userVoteReceiptData) {
      const receipt = userVoteReceiptData as VoteReceipt; 
      setHasVoted(receipt.hasVoted);
    } else if (proposalStatus === ProposalStatus[ProposalStatus.Active]) {
        setHasVoted(false);
    }
  }, [userVoteReceiptData, proposalStatus]);

  useEffect(() => {
    let isMounted = true;
    const fetchStatus = async () => {
       if (id !== undefined) {
           if (isMounted) setProposalStatus(null); 
           const status = await getProposalState(id);
           if (isMounted) {
               setProposalStatus(status);
           }
       }
    };
    fetchStatus();
    return () => { isMounted = false; };
  }, [id, getProposalState, pendingTxHash]);

  const { isSuccess: isTxSuccess } = useWaitForTransactionReceipt({ hash: pendingTxHash });
  useEffect(() => {
    if (isTxSuccess) {
      refetchProposal();
      refetchVotes();
      refetchReceipt();
      setTimeout(() => getProposalState(id!).then(setProposalStatus), 1000); 
      setPendingTxHash(undefined); 
    }
  }, [isTxSuccess, refetchProposal, refetchVotes, refetchReceipt, getProposalState, id]);

  const handleVote = async (support: boolean) => {
    if (id === undefined) return;
    setPendingTxHash(undefined);
    try {
      const txHash = await vote(id, support)
      if (txHash) {
        toast.loading('Submitting vote transaction...')
        setPendingTxHash(txHash);
      } else {
        toast.error('Failed to initiate vote transaction.');
      }
    } catch (err) {
      console.error('Error voting:', err)
    } 
  }
  
  const handleQueue = async () => {
      if (id === undefined || !fullProposalData) return;
      setPendingTxHash(undefined);
      try {
          const txHash = await queueProposal(id, fullProposalData.description);
          if (txHash) {
              toast.loading('Submitting queue transaction...');
              setPendingTxHash(txHash);
          } else {
              toast.error('Failed to initiate queue transaction.');
          }
      } catch (err) {
          console.error('Error queuing:', err);
      }
  }

  const handleExecute = async () => {
      if (id === undefined || !fullProposalData) return;
      setPendingTxHash(undefined);
      try {
          const txHash = await executeProposal(id, fullProposalData.description);
          if (txHash) {
              toast.loading('Submitting execute transaction...');
              setPendingTxHash(txHash);
          } else {
              toast.error('Failed to initiate execute transaction.');
          }
      } catch (err) {
          console.error('Error executing:', err);
      }
  }

  const isLoadingPage = isLoadingProposal || (!proposalStatus && id !== undefined);

  if (isLoadingPage) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Loading proposal details...</h2>
      </div>
    )
  }
  
  if (!fullProposalData) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Proposal not found.</h2>
      </div>
    )
  }

  const safeProposalVotes = proposalVotes ?? { forVotes: 0n, againstVotes: 0n, abstainVotes: 0n };
  const totalVotes = safeProposalVotes.forVotes + safeProposalVotes.againstVotes + safeProposalVotes.abstainVotes;
  
  const forPercentage = totalVotes > 0n ? 
    Number(safeProposalVotes.forVotes * 10000n / totalVotes) / 100 : 0;
  
  const againstPercentage = totalVotes > 0n ? 
    Number(safeProposalVotes.againstVotes * 10000n / totalVotes) / 100 : 0;

  const abstainPercentage = totalVotes > 0n ? 
    Number(safeProposalVotes.abstainVotes * 10000n / totalVotes) / 100 : 0;

  const canVote = proposalStatus === ProposalStatus[ProposalStatus.Active] && hasVoted === false && !isVoting; 
  const canQueue = proposalStatus === ProposalStatus[ProposalStatus.Succeeded] && !isQueuing;
  const canExecute = proposalStatus === ProposalStatus[ProposalStatus.Queued] && !isExecuting;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <TransactionToast hash={pendingTxHash} />
      <div>
        <h1 className="text-2xl font-bold mb-2">{fullProposalData.description}</h1>
        <div className="flex items-center gap-4">
          <span className={`px-3 py-1 rounded-full text-sm ${ 
              proposalStatus === ProposalStatus[ProposalStatus.Active] ? 'bg-yellow-100 text-yellow-800' : 
              proposalStatus === ProposalStatus[ProposalStatus.Succeeded] ? 'bg-green-100 text-green-800' :
              proposalStatus === ProposalStatus[ProposalStatus.Queued] ? 'bg-blue-100 text-blue-800' :
              proposalStatus === ProposalStatus[ProposalStatus.Executed] ? 'bg-purple-100 text-purple-800' :
              proposalStatus === ProposalStatus[ProposalStatus.Defeated] || proposalStatus === ProposalStatus[ProposalStatus.Canceled] || proposalStatus === ProposalStatus[ProposalStatus.Expired] ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800' 
          }`}>
            {proposalStatus || 'Loading...'}
          </span>
          <span className="text-sm text-gray-500">
            Category: {['General', 'Technical', 'Community', 'Treasury'][fullProposalData.category]}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t border-b py-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Proposer</h3>
          <p className="font-mono text-sm break-all">{fullProposalData.proposer}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Your Voting Power</h3>
          <p>{votingPower?.toString() ?? '0'} votes</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Start Block</h3>
          <p>{fullProposalData.startBlock.toString()}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">End Block</h3>
          <p>{fullProposalData.endBlock.toString()}</p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Voting Results</h2>
         {isLoadingVotes ? <p>Loading votes...</p> : (
             <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>For</span>
                <span>{forPercentage.toFixed(2)}% ({safeProposalVotes.forVotes.toString()})</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: `${forPercentage}%` }}/>
              </div>
              <div className="flex justify-between items-center">
                <span>Against</span>
                <span>{againstPercentage.toFixed(2)}% ({safeProposalVotes.againstVotes.toString()})</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-red-500" style={{ width: `${againstPercentage}%` }}/>
              </div>
              <div className="flex justify-between items-center">
                <span>Abstain</span>
                <span>{abstainPercentage.toFixed(2)}% ({safeProposalVotes.abstainVotes.toString()})</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gray-500" style={{ width: `${abstainPercentage}%` }}/>
              </div>
            </div>
         )} 

        <div className="mt-8 pt-6 border-t">
            {proposalStatus === ProposalStatus[ProposalStatus.Active] && (
                <>
                    {isLoadingVoteReceipt && <p className="text-center text-gray-500 mb-4">Checking your vote status...</p>} 
                    {!isLoadingVoteReceipt && hasVoted === false && (
                        <div className="flex gap-4">
                            <Button onClick={() => handleVote(true)} disabled={isVoting} className="flex-1">
                                {isVoting ? 'Processing Vote...' : 'Vote For'}
                            </Button>
                            <Button onClick={() => handleVote(false)} disabled={isVoting} variant="outline" className="flex-1 bg-red-50 hover:bg-red-100 border-red-200 text-red-700">
                                {isVoting ? 'Processing Vote...' : 'Vote Against'}
                            </Button>
                        </div>
                    )}
                    {!isLoadingVoteReceipt && hasVoted === true && (
                        <p className="text-center text-green-600 font-medium">You have already voted on this proposal.</p>
                    )} 
                </>
            )}

             {canQueue && (
                <Button onClick={handleQueue} disabled={isQueuing} className="w-full">
                    {isQueuing ? 'Queuing Transaction...' : 'Queue Proposal for Execution'}
                </Button>
             )}

             {canExecute && (
                <Button onClick={handleExecute} disabled={isExecuting} className="w-full">
                    {isExecuting ? 'Executing Transaction...' : 'Execute Proposal'}
                </Button>
             )}

            { ![ ProposalStatus[ProposalStatus.Active], 
                ProposalStatus[ProposalStatus.Succeeded], 
                ProposalStatus[ProposalStatus.Queued], 
                ProposalStatus[ProposalStatus.Executed]
              ].includes(proposalStatus ?? '') && proposalStatus !== null && (
              <p className="text-center text-gray-500 font-medium">This proposal is currently {proposalStatus?.toLowerCase()} and cannot be acted upon further.</p>
            )}
             {proposalStatus === ProposalStatus[ProposalStatus.Executed] && (
                <p className="text-center text-purple-600 font-medium">This proposal has been executed.</p>
            )}
        </div>
      </div>
    </div>
  )
} 