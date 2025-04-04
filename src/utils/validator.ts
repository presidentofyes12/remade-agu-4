import { CoreContracts, ConceptSystem } from '../contracts/deployments'
import { readContract } from 'wagmi/actions'
import { config } from '../config/wagmi'
import { computeTripartiteValue, validateTripartiteSum } from './math'
import { Abi } from 'viem'

// Define ABI types
type TripartiteComputationsABI = typeof ConceptSystem.TripartiteComputations.abi
type ConceptMappingABI = typeof ConceptSystem.ConceptMapping.abi
type ConceptValuesABI = typeof ConceptSystem.ConceptValues.abi

export class MathematicalValidator {
  /**
   * Validates the consistency of a mathematical operation between off-chain and on-chain
   */
  static async validateOperation(
    offchainResult: bigint,
    onchainFunction: string,
    args: any[]
  ): Promise<{
    isValid: boolean
    offchainResult: bigint
    onchainResult: bigint | null
    error?: string
  }> {
    try {
      const onchainResult = await readContract(config, {
        address: ConceptSystem.TripartiteComputations.address,
        abi: ConceptSystem.TripartiteComputations.abi as unknown as readonly unknown[],
        functionName: onchainFunction,
        args: args,
      })

      let onchainResultBigInt: bigint | null = null

      if (typeof onchainResult === 'bigint') {
        onchainResultBigInt = onchainResult
      } else if (typeof onchainResult === 'string') {
        try {
          onchainResultBigInt = BigInt(onchainResult)
        } catch (error) {
          return {
            isValid: false,
            offchainResult,
            onchainResult: null,
            error: 'Invalid on-chain result format',
          }
        }
      } else {
        return {
          isValid: false,
          offchainResult,
          onchainResult: null,
          error: 'Unexpected on-chain result type',
        }
      }

      return {
        isValid: offchainResult === onchainResultBigInt,
        offchainResult,
        onchainResult: onchainResultBigInt,
      }
    } catch (error) {
      return {
        isValid: false,
        offchainResult,
        onchainResult: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Validates a tripartite value and its components
   */
  static validateTripartiteValue(value: bigint): {
    isValid: boolean
    components: {
      result: bigint
      first: bigint | null
      second: bigint | null
      third: bigint | null
    }
    error?: string
  } {
    try {
      const components = computeTripartiteValue(value)

      if (components.first === null || components.second === null || components.third === null) {
        return {
          isValid: false,
          components,
          error: 'No tripartite relationship defined for this value',
        }
      }

      const isValid = validateTripartiteSum(
        components.first,
        components.second,
        components.third,
        value
      )

      return {
        isValid,
        components,
        error: isValid ? undefined : 'Tripartite sum does not match expected value',
      }
    } catch (error) {
      return {
        isValid: false,
        components: {
          result: value,
          first: null,
          second: null,
          third: null,
        },
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Simulates a transaction and validates its mathematical consistency
   */
  static async validateTransaction(
    functionName: string,
    args: any[],
    contract: typeof CoreContracts[keyof typeof CoreContracts],
    expectedResult?: bigint
  ): Promise<{
    success: boolean
    result: any
    isValid: boolean
    error?: string
  }> {
    try {
      const result = await readContract(config, {
        address: contract.address,
        abi: contract.abi as unknown as readonly unknown[],
        functionName: functionName,
        args: args,
      })

      let isValid = true
      if (expectedResult !== undefined) {
        if (typeof result === 'bigint') {
          isValid = result === expectedResult
        } else if (typeof result === 'string') {
          try {
            isValid = BigInt(result) === expectedResult
          } catch (error) {
            isValid = false
          }
        } else {
          isValid = false
        }
      }

      return {
        success: true,
        result,
        isValid,
        error: isValid ? undefined : 'Result does not match expected value',
      }
    } catch (error) {
      return {
        success: false,
        result: null,
        isValid: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Validates a series of mathematical operations
   */
  static async validateOperations(
    operations: Array<{
      offchainResult: bigint
      onchainFunction: string
      args: any[]
    }>
  ): Promise<Array<{
    isValid: boolean
    offchainResult: bigint
    onchainResult: bigint | null
    error?: string
  }>> {
    try {
      const results = await Promise.all(
        operations.map((op) =>
          this.validateOperation(op.offchainResult, op.onchainFunction, op.args)
        )
      )

      return results
    } catch (error) {
      console.error('Error validating operations:', error)
      return operations.map((op) => ({
        isValid: false,
        offchainResult: op.offchainResult,
        onchainResult: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      }))
    }
  }
} 