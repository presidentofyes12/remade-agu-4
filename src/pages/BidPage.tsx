import React, { useState } from 'react'
import { useAccount } from 'wagmi'
import { BidForm } from '../components/BidForm'
import { BidValidator } from '../utils/bidValidator'
import { MathematicalValidator } from '../utils/validator'

export function BidPage() {
  const { address } = useAccount()
  const [bidValidator] = useState(() => new BidValidator())
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (amount: bigint, price: bigint) => {
    try {
      setError(null)
      setSuccess(null)

      // Validate the bid one final time before submission
      const validation = await bidValidator.validateBid(amount, price)
      if (!validation.isValid) {
        throw new Error(validation.error || 'Invalid bid')
      }

      // TODO: Implement actual bid submission logic here
      // This would typically involve calling a contract function
      console.log('Submitting bid:', { amount, price })

      setSuccess('Bid submitted successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit bid')
    }
  }

  if (!address) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Connect Wallet</h2>
        <p className="mt-2 text-gray-600">Please connect your wallet to place bids</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Daily PITA Bidding
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>Place your bid for the daily PITA allocation.</p>
          </div>
          <div className="mt-5">
            <BidForm onSubmit={handleSubmit} />
          </div>
          {error && (
            <div className="mt-4 text-sm text-red-600">
              {error}
            </div>
          )}
          {success && (
            <div className="mt-4 text-sm text-green-600">
              {success}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 