import { useState, useEffect } from 'react'
import { type Hash } from 'viem'
import { contractService } from '../services/ContractService'
import type { ContractEvent } from '../contracts/types'
import { CONTRACT_CONFIGS } from '../contracts/config'

interface UseContractResult<T = unknown> {
  data: T | null
  loading: boolean
  error: Error | null
  write: (functionName: string, args?: unknown[]) => Promise<Hash>
  events: ContractEvent[]
  pendingTransactions: { hash: Hash; status: 'pending' | 'success' | 'failed' }[]
}

export function useContract<T = unknown>(
  address: string,
  functionName?: string,
  args: unknown[] = []
): UseContractResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [events, setEvents] = useState<ContractEvent[]>([])
  const [pendingTransactions, setPendingTransactions] = useState<
    { hash: Hash; status: 'pending' | 'success' | 'failed' }[]
  >([])

  useEffect(() => {
    const config = CONTRACT_CONFIGS.find(c => c.address === address)
    if (!config) {
      setError(new Error(`No configuration found for contract ${address}`))
      setLoading(false)
      return
    }

    let isMounted = true
    let cleanupPromise: Promise<void> | undefined

    const initializeAndFetch = async () => {
      try {
        await contractService.initializeContract(config)
        
        if (functionName && isMounted) {
          const result = await contractService.readContract<T>(address, functionName, args)
          if (isMounted) {
            setData(result as T)
          }
        }
        
        if (isMounted) {
          setLoading(false)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to initialize contract'))
          setLoading(false)
        }
      }
    }

    initializeAndFetch()

    // Cleanup function
    return () => {
      isMounted = false
      cleanupPromise = contractService.cleanup() as Promise<void>
    }
  }, [address, functionName, JSON.stringify(args)])

  const write = async (writeFunctionName: string, writeArgs: unknown[] = []): Promise<Hash> => {
    try {
      const hash = await contractService.writeContract(address, writeFunctionName, writeArgs)
      setPendingTransactions(prev => [...prev, { hash, status: 'pending' }])
      return hash
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to write to contract')
    }
  }

  return {
    data,
    loading,
    error,
    write,
    events,
    pendingTransactions
  }
}

export function useContractEvents(address: string): ContractEvent[] {
  const [events, setEvents] = useState<ContractEvent[]>([])

  useEffect(() => {
    const config = CONTRACT_CONFIGS.find(c => c.address === address)
    if (!config) return

    const initializeAndSubscribe = async () => {
      try {
        await contractService.initializeContract(config)
        // Events will be automatically updated through the contract service
      } catch (error) {
        console.error('Failed to initialize contract for events:', error)
      }
    }

    initializeAndSubscribe()

    return () => {
      contractService.cleanup()
    }
  }, [address])

  return events
}

export function useContractWrite(address: string) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [hash, setHash] = useState<Hash | null>(null)

  const write = async (functionName: string, args: unknown[] = []): Promise<Hash> => {
    setLoading(true)
    setError(null)
    try {
      const txHash = await contractService.writeContract(address, functionName, args)
      setHash(txHash)
      return txHash
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to write to contract')
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return { write, loading, error, hash }
} 