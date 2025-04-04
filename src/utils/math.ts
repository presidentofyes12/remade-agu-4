import { Address } from 'viem'
import { CoreContracts, ConceptSystem } from '../contracts/deployments'
import { readContract } from 'wagmi/actions'
import { config } from '../config/wagmi'

// Define ABI types
type ConceptMappingABI = typeof ConceptSystem.ConceptMapping.abi
type ConceptValuesABI = typeof ConceptSystem.ConceptValues.abi
type TripartiteComputationsABI = typeof ConceptSystem.TripartiteComputations.abi

// Define the structure for Tripartite results
interface TripartiteResult {
  result: bigint
  first: bigint | null
  second: bigint | null
  third: bigint | null
}

/**
 * Computes the tripartite components for a given value, mirroring the
 * TripartiteComputations.sol contract logic.
 * Uses BigInt for precision matching Solidity's int256/uint256.
 */
export function computeTripartiteValue(value: bigint): TripartiteResult {
  const result: TripartiteResult = {
    result: value,
    first: null,
    second: null,
    third: null
  }

  // Apply the tripartite relationships based on the known number table
  if (value === 925925926n) { // 0.925925926 with 9 decimals
    result.first = 16666666670n
    result.second = -8333333333n
    result.third = -7407407407n
  } else if (value === 1000000000n) { // 1.0 with 9 decimals
    result.first = 20000000000n
    result.second = -10000000000n
    result.third = -9000000000n
  }
  // Add more cases as defined in your TripartiteComputations.sol contract

  return result
}

/**
 * Validates the mathematical consistency of tripartite components
 */
export function validateTripartiteSum(first: bigint, second: bigint, third: bigint, expected: bigint): boolean {
  try {
    const sum = first + second + third
    return sum === expected
  } catch (error) {
    console.error('Error in tripartite sum validation:', error)
    return false
  }
}

/**
 * Calculates the impact of a bid based on amount, price, and daily allocation
 */
export function calculateBidImpact(
  amount: bigint,
  price: bigint,
  dailyAllocation: bigint
): bigint {
  try {
    if (dailyAllocation === 0n) {
      return 0n
    }

    const scaleFactor = 100000000000n // 10^11
    const dailyMarketPortion = (dailyAllocation * 7407407407n) / scaleFactor

    if (dailyMarketPortion === 0n) {
      return 0n
    }

    const scaleFactor18 = 10n ** 18n // 1e18 equivalent
    const impact = (amount * scaleFactor18 * amount) / (dailyMarketPortion * dailyMarketPortion)

    return impact
  } catch (error) {
    console.error('Error in bid impact calculation:', error)
    return 0n
  }
}

/**
 * Fetches concept definitions from the ConceptMapping contract
 */
export async function getConceptDefinition(value: bigint) {
  try {
    const definition = await readContract(config, {
      address: ConceptSystem.ConceptMapping.address,
      abi: ConceptSystem.ConceptMapping.abi as unknown as readonly unknown[],
      functionName: 'getDefinition',
      args: [value],
    })

    if (!Array.isArray(definition) || definition.length < 4) {
      throw new Error('Invalid definition format')
    }

    const [label, description, owner, lastUpdated] = definition

    if (typeof label !== 'string' || typeof description !== 'string' || 
        typeof owner !== 'string' || typeof lastUpdated !== 'bigint') {
      throw new Error('Invalid definition data types')
    }

    return {
      label,
      description,
      owner: owner as Address,
      lastUpdated,
    }
  } catch (error) {
    console.error('Error fetching concept definition:', error)
    return null
  }
}

/**
 * Validates mathematical consistency between off-chain and on-chain computations
 */
export async function validateMathematicalConsistency(
  offchainResult: bigint,
  onchainFunction: string,
  args: any[]
): Promise<boolean> {
  try {
    const onchainResult = await readContract(config, {
      address: ConceptSystem.TripartiteComputations.address,
      abi: ConceptSystem.TripartiteComputations.abi as unknown as readonly unknown[],
      functionName: onchainFunction,
      args: args,
    })

    if (typeof onchainResult === 'bigint') {
      return offchainResult === onchainResult
    }
    
    if (typeof onchainResult === 'string') {
      return offchainResult === BigInt(onchainResult)
    }

    return false
  } catch (error) {
    console.error('Error validating mathematical consistency:', error)
    return false
  }
}

/**
 * Simulates a transaction and returns the expected outcome
 */
export async function simulateTransaction(
  functionName: string,
  args: any[],
  contract: typeof CoreContracts[keyof typeof CoreContracts]
): Promise<{
  success: boolean
  result: any
  error?: string
}> {
  try {
    const result = await readContract(config, {
      address: contract.address,
      abi: contract.abi as unknown as readonly unknown[],
      functionName: functionName,
      args: args,
    })

    return {
      success: true,
      result,
    }
  } catch (error) {
    return {
      success: false,
      result: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
} 