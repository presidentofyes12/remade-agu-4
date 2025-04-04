import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useGovernance, ProposalStatus } from '../hooks/useGovernance'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { toast } from 'sonner'
import { DaoAgreementModal } from '../components/DaoAgreementModal'
import { TransactionToast } from '../components/TransactionToast'
import { useWaitForTransactionReceipt } from 'wagmi'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

const DAO_AGREEMENT_KEY = 'daoAgreementAccepted';

interface Proposal {
  id: number
  description: string
  category: number
  status: string
}

export default function Proposals() {
  const [isCreating, setIsCreating] = useState(false)
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState(0)
  const [delegatee, setDelegatee] = useState('')
  const [isDelegating, setIsDelegating] = useState(false)
  const { submitProposal, proposals, isLoadingProposals, error, delegateVotes, votingPower } = useGovernance()
  
  const [showDaoAgreement, setShowDaoAgreement] = useState(false);
  const [pendingTxHash, setPendingTxHash] = useState<`0x${string}` | undefined>(undefined);
  const [isCreateProposalOpen, setIsCreateProposalOpen] = useState(false);
  const [isDelegateOpen, setIsDelegateOpen] = useState(false);

  const { isSuccess: isTxSuccess } = useWaitForTransactionReceipt({ hash: pendingTxHash });

  useEffect(() => {
    if (isTxSuccess) {
      if (isCreateProposalOpen) setIsCreateProposalOpen(false);
      if (isDelegateOpen) setIsDelegateOpen(false);
      setPendingTxHash(undefined);
    }
  }, [isTxSuccess, isCreateProposalOpen, isDelegateOpen]);

  useEffect(() => {
    const accepted = localStorage.getItem(DAO_AGREEMENT_KEY);
    if (!accepted) {
      setShowDaoAgreement(true);
    }
  }, []);

  const handleAcceptDaoAgreement = () => {
    setShowDaoAgreement(false);
  };

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)
    setPendingTxHash(undefined);
    try {
      const txHash = await submitProposal(description, category)
      if (txHash) {
         toast.loading('Submitting proposal transaction...')
         setPendingTxHash(txHash);
         setDescription('')
         setCategory(0)
      } else {
         toast.error('Failed to initiate proposal transaction.');
         setIsCreating(false);
      }
    } catch (err) {
      console.error('Error creating proposal:', err)
      const message = err instanceof Error ? err.message : 'Failed to create proposal'
      toast.error(message)
       setIsCreating(false);
    }
  }

  useEffect(() => {
    if (!pendingTxHash) {
       setIsCreating(false);
       setIsDelegating(false);
    }
  }, [pendingTxHash]);

  const handleDelegate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!delegatee) {
      toast.error('Please enter a delegatee address')
      return
    }
    setIsDelegating(true);
    setPendingTxHash(undefined);
    try {
      const txHash = await delegateVotes(delegatee as `0x${string}`)
      if (txHash) {
        toast.loading('Submitting delegation transaction...');
        setPendingTxHash(txHash);
        setDelegatee('')
      } else {
         toast.error('Failed to initiate delegation transaction.');
          setIsDelegating(false);
      }
    } catch (err) {
      console.error('Error delegating votes:', err)
       const message = err instanceof Error ? err.message : 'Failed to delegate votes'
      toast.error(message)
       setIsDelegating(false);
    }
  }

  if (showDaoAgreement) {
    return (
      <DaoAgreementModal 
        isOpen={showDaoAgreement} 
        onAccept={handleAcceptDaoAgreement} 
        onOpenChange={setShowDaoAgreement} 
      />
    );
  }

  return (
    <div className="space-y-6">
      <TransactionToast hash={pendingTxHash} />

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Proposals</h1>
        <div className="flex gap-4">
          <Dialog open={isCreateProposalOpen} onOpenChange={setIsCreateProposalOpen}>
            <DialogTrigger asChild>
              <Button>Create Proposal</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Proposal</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateProposal} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    rows={4}
                    required
                    disabled={isCreating}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(Number(e.target.value))}
                    className="w-full p-2 border rounded-md"
                    required
                    disabled={isCreating}
                  >
                    <option value={0}>General</option>
                    <option value={1}>Technical</option>
                    <option value={2}>Community</option>
                    <option value={3}>Treasury</option>
                  </select>
                </div>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? 'Submitting...' : 'Create Proposal'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isDelegateOpen} onOpenChange={setIsDelegateOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Delegate Votes</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delegate Your Voting Power</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleDelegate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Delegatee Address
                  </label>
                  <input
                    type="text"
                    value={delegatee}
                    onChange={(e) => setDelegatee(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    placeholder="0x..."
                    required
                    disabled={isDelegating}
                  />
                </div>
                <div className="text-sm text-gray-500">
                  Your current voting power: {votingPower?.toString() || '0'} votes
                </div>
                <Button type="submit" disabled={isDelegating}>
                   {isDelegating ? 'Delegating...' : 'Delegate'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="grid gap-4">
        {isLoadingProposals ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold">Loading proposals...</h2>
          </div>
        ) : proposals.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold">No proposals yet</h2>
            <p className="text-gray-500">Be the first to create a proposal!</p>
          </div>
        ) : (
          proposals.map((proposal: Proposal) => (
            <Link
              key={proposal.id}
              to={`/proposals/${proposal.id}`}
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{proposal.description}</h3>
                  <p className="text-sm text-gray-500">
                    Category: {['General', 'Technical', 'Community', 'Treasury'][proposal.category]}
                  </p>
                </div>
                <span className={`px-2 py-1 text-sm rounded-full ${
                  proposal.status === ProposalStatus[ProposalStatus.Active] ? 'bg-green-100 text-green-700' :
                  proposal.status === ProposalStatus[ProposalStatus.Succeeded] ? 'bg-blue-100 text-blue-700' :
                  proposal.status === ProposalStatus[ProposalStatus.Defeated] ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {proposal.status}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
} 