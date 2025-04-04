import React, { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { BidValidator } from '../utils/bidValidator'

interface BidFormProps {
  onSubmit: (amount: bigint, price: bigint) => Promise<void>
}

export function BidForm({ onSubmit }: BidFormProps) {
  const { address } = useAccount()
  const [amount, setAmount] = useState('')
  const [price, setPrice] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean
    impact: bigint
    dailyAllocation: bigint
    simulationSuccess?: boolean
    error?: string
  } | null>(null)
  const [bidValidator] = useState(() => new BidValidator())
  const [locationId, setLocationId] = useState(1);
  const [slotId, setSlotId] = useState(0);
  const [patternValue, setPatternValue] = useState('');
  const [durationMs, setDurationMs] = useState('');

  useEffect(() => {
    if (!address) {
      setValidationResult(null)
      return
    }

    const validateBid = async () => {
      if (!amount || !price || !patternValue || !durationMs) {
        setValidationResult(null)
        return
      }

      try {
        setIsValidating(true)
        const amountBigInt = BigInt(amount)
        const priceBigInt = BigInt(price)
        const patternValueBigInt = BigInt(patternValue)
        const durationMsBigInt = BigInt(durationMs)

        // Run all validations sequentially
        
        // 1. Validate bid limits
        const limitsValidation = await bidValidator.validateBidLimits(amountBigInt, priceBigInt)
        if (!limitsValidation.isValid) {
          setValidationResult({
            isValid: false,
            impact: 0n,
            dailyAllocation: 0n,
            simulationSuccess: false,
            error: limitsValidation.error
          })
          return
        }

        // 2. Validate conceptual parameters
        const conceptualValidation = await bidValidator.validateConceptualBid(
          locationId, 
          slotId, 
          patternValueBigInt, 
          durationMsBigInt
        )
        if (!conceptualValidation.isValid) {
          setValidationResult({
            isValid: false,
            impact: 0n,
            dailyAllocation: 0n,
            simulationSuccess: false,
            error: conceptualValidation.error
          })
          return
        }

        // 3. Validate bid amount/price against allocation
        const result = await bidValidator.validateBid(amountBigInt, priceBigInt)
        if (!result.isValid) {
          setValidationResult({
            isValid: false,
            impact: result.impact ?? 0n,
            dailyAllocation: result.dailyAllocation ?? 0n,
            simulationSuccess: false,
            error: result.error
          })
          return
        }

        // 4. If all validations passed, simulate the bid
        const simulation = await bidValidator.simulateBid(amountBigInt, priceBigInt)
        setValidationResult({
          isValid: result.isValid && simulation.success,
          impact: result.impact ?? 0n,
          dailyAllocation: result.dailyAllocation ?? 0n,
          simulationSuccess: simulation.success,
          error: simulation.success ? undefined : simulation.error
        })
      } catch (error) {
        console.error("Validation/Simulation Error:", error)
        setValidationResult({
          isValid: false,
          impact: 0n,
          dailyAllocation: 0n,
          simulationSuccess: false,
          error: error instanceof Error ? error.message : 'Unknown validation error'
        })
      } finally {
        setIsValidating(false)
      }
    }

    validateBid()
  }, [address, amount, price, locationId, slotId, patternValue, durationMs, bidValidator])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validationResult?.isValid || !validationResult?.simulationSuccess || !amount || !price) return

    try {
      await onSubmit(BigInt(amount), BigInt(price))
      setAmount('')
      setPrice('')
      setValidationResult(null)
    } catch (error) {
      console.error('Error submitting bid:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
          Amount
        </label>
        <input
          type="text"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Enter amount"
        />
      </div>

      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700">
          Price
        </label>
        <input
          type="text"
          id="price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Enter price"
        />
      </div>

      {isValidating && (
        <div className="text-sm text-gray-500">Validating and simulating bid...</div>
      )}

      {validationResult && (
        <div className={`text-sm ${validationResult.isValid && validationResult.simulationSuccess ? 'text-green-600' : 'text-red-600'}`}>
          {validationResult.isValid && validationResult.simulationSuccess ? (
            <>
              <p>Bid Impact: {validationResult.impact.toString()}</p>
              <p>Daily Allocation: {validationResult.dailyAllocation.toString()}</p>
              <p className="text-green-600">✓ Simulation successful</p>
            </>
          ) : (
            <p>Error: {validationResult.error}</p>
          )}
        </div>
      )}

      <div>
        <label htmlFor="locationId" className="block text-sm font-medium text-gray-700">
          Location ID (Concept)
        </label>
        <input
          type="number"
          id="locationId"
          value={locationId}
          min="1"
          max="108"
          onChange={(e) => setLocationId(parseInt(e.target.value, 10) || 1)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="slotId" className="block text-sm font-medium text-gray-700">
          Slot ID (Dimension)
        </label>
        <input
          type="number"
          id="slotId"
          value={slotId}
          min="0"
          max="8"
          onChange={(e) => setSlotId(parseInt(e.target.value, 10) || 0)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
       <div>
        <label htmlFor="patternValue" className="block text-sm font-medium text-gray-700">
          Pattern Value
        </label>
        <input
          type="text"
          id="patternValue"
          value={patternValue}
          onChange={(e) => setPatternValue(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Enter pattern value"
        />
      </div>
       <div>
        <label htmlFor="durationMs" className="block text-sm font-medium text-gray-700">
          Duration (ms)
        </label>
        <input
          type="text"
          id="durationMs"
          value={durationMs}
          onChange={(e) => setDurationMs(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Enter duration in milliseconds"
        />
      </div>

      <button
        type="submit"
        disabled={!validationResult?.isValid || !validationResult?.simulationSuccess || isValidating}
        className={`w-full rounded-md px-4 py-2 text-sm font-medium text-white ${
          validationResult?.isValid && validationResult?.simulationSuccess && !isValidating
            ? 'bg-indigo-600 hover:bg-indigo-700'
            : 'bg-gray-400 cursor-not-allowed'
        }`}
      >
        {isValidating ? 'Validating...' : 'Submit Bid'}
      </button>
    </form>
  )
} 