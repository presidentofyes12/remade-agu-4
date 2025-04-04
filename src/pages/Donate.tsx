import React, { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { Heart, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CoreContracts } from '@/contracts/deployments'
import { parseEther, Abi } from 'viem'

const Donate: React.FC = () => {
  const { isConnected, address } = useAccount()
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)

  const { data: hash, writeContract, isPending: isSubmitting, error: submitError } = useWriteContract()

  const { isLoading: isProcessing, isSuccess, error: receiptError } = useWaitForTransactionReceipt({
    hash,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!amount) {
      setError("Please enter a donation amount.")
      return
    }

    try {
      const parsedValue = parseEther(amount)
      if (parsedValue <= 0n) {
        setError("Donation amount must be positive.")
        return
      }

      writeContract({
        address: CoreContracts.DAOToken.address,
        abi: CoreContracts.DAOToken.abi.abi as Abi,
        functionName: 'donate',
        args: [message],
        value: parsedValue,
      })

    } catch (err) {
      console.error("Error parsing amount or preparing transaction:", err)
      setError("Invalid amount entered. Please enter a valid number.")
    }
  }

  React.useEffect(() => {
    if (submitError) {
      setError(`Submission Error: ${submitError.message}`)
    }
  }, [submitError])

  React.useEffect(() => {
    if (receiptError) {
      setError(`Transaction Error: ${receiptError.message}`)
    }
  }, [receiptError])

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link
        to="/"
        className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-8"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Home
      </Link>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center mb-8">
          <Heart className="h-12 w-12 text-pink-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Support Free Transactions</h1>
          <p className="mt-2 text-gray-600">
            Your donation helps cover transaction fees for DAO members, making participation more accessible.
          </p>
        </div>

        {!isConnected ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Please connect your wallet to make a donation.</p>
            <Link
              to="/dashboard"
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              Connect Wallet
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                Amount (ETH)
              </label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                placeholder="0.1"
                step="any"
                min="0"
                required
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                Message (Optional)
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                placeholder="Add a message to your donation..."
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting || isProcessing || !amount}
                className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : isProcessing ? 'Processing...' : (
                  <>
                    Donate
                    <Heart className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
            </div>
            {isSuccess && (
              <div className="text-center text-green-600">
                Donation successful! Thank you for your support.
                {hash && (
                  <p className="text-xs mt-1">
                    Transaction Hash: <a href={`https://scan.pulsechain.com/tx/${hash}`} target="_blank" rel="noopener noreferrer" className="underline">{hash.substring(0, 6)}...{hash.substring(hash.length - 4)}</a>
                  </p>
                )}
              </div>
            )}
            {error && (
              <div className="text-center text-red-600">
                Error: {error}
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  )
}

export default Donate 