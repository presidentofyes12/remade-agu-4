import { readContract } from '@wagmi/core'
import { CoreContracts } from '../contracts/deployments'
import { calculateBidImpact } from './math'
import { MathematicalValidator } from './validator'
import { config } from '../config/wagmi'
import { getConceptForLocation, derivePatternFromConcept } from './conceptUtils'
import { Abi } from 'viem'

interface ValidationResult {
  isValid: boolean
  error?: string
  impact?: bigint
  dailyAllocation?: bigint
}

interface SimulationResult {
  success: boolean
  error?: string
  impact?: bigint
}

export class BidValidator {
  async validateBid(amount: bigint, price: bigint): Promise<ValidationResult> {
    try {
      const dailyAllocation = await this.getDailyAllocation()
      
      if (amount > dailyAllocation) {
        return {
          isValid: false,
          error: 'Bid amount exceeds daily allocation limit',
          dailyAllocation
        }
      }

      const impact = await calculateBidImpact(amount, price, dailyAllocation)
      const limitsValidation = await this.validateBidLimits(amount, price)
      
      if (!limitsValidation.isValid) {
        return limitsValidation
      }

      return {
        isValid: true,
        impact,
        dailyAllocation
      }
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Contract error'
      }
    }
  }

  async validateBidLimits(amount: bigint, price: bigint): Promise<ValidationResult> {
    try {
      const [minBid, maxBid] = await Promise.all([
        this.getMinBidAmount(),
        this.getMaxBidAmount()
      ])

      if (amount < minBid) {
        return {
          isValid: false,
          error: `Bid amount must be at least ${minBid}`
        }
      }

      if (amount > maxBid) {
        return {
          isValid: false,
          error: `Bid amount cannot exceed ${maxBid}`
        }
      }

      return {
        isValid: true
      }
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Contract error'
      }
    }
  }

  async simulateBid(amount: bigint, price: bigint): Promise<SimulationResult> {
    try {
      const dailyAllocation = await this.getDailyAllocation()
      const impact = await calculateBidImpact(amount, price, dailyAllocation)
      const validationResult = await MathematicalValidator.validateTransaction(
        'placeBid',
        [amount, price],
        CoreContracts.LogicConstituent,
        impact
      )

      if (!validationResult.isValid) {
        return {
          success: false,
          error: validationResult.error || 'Transaction validation failed'
        }
      }

      return {
        success: true,
        impact
      }
    } catch (error) {
      console.error("Error during bid simulation:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Simulation error occurred'
      }
    }
  }

  async validateConceptualBid(locationId: number, slotId: number, patternValue: bigint, durationMs: bigint, allowedDeviation: bigint = 0n): Promise<ValidationResult> {
    try {
      const chironSlotValidation = await MathematicalValidator.validateTransaction(
        'validateChironSlot',
        [BigInt(locationId), BigInt(slotId), patternValue, durationMs],
        CoreContracts.LogicConstituent
      );

      if (!chironSlotValidation.success || typeof chironSlotValidation.result !== 'boolean') {
        return { isValid: false, error: chironSlotValidation.error || 'Failed to validate Chiron slot parameters on-chain.' };
      }
      if (chironSlotValidation.result !== true) {
        return { isValid: false, error: 'Chiron slot parameters failed contract validation.' };
      }

      const conceptValue = getConceptForLocation(locationId);
      const expectedPattern = derivePatternFromConcept(conceptValue, slotId);

      const difference = patternValue > expectedPattern ? patternValue - expectedPattern : expectedPattern - patternValue;
      const isConceptuallyValid = difference <= allowedDeviation;

      if (!isConceptuallyValid) {
        return {
          isValid: false,
          error: `Bid patternValue ${patternValue} deviates too much from expected pattern ${expectedPattern} for concept ${conceptValue} / slot ${slotId}.`
        };
      }

      return { isValid: true };

    } catch (error) {
      console.error("Error during conceptual bid validation:", error);
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Conceptual validation error'
      };
    }
  }

  private async getDailyAllocation(): Promise<bigint> {
    const result = await readContract(config, {
      address: CoreContracts.LogicConstituent.address,
      abi: CoreContracts.LogicConstituent.abi as unknown as Abi,
      functionName: 'getDailyAllocation',
      args: []
    })
    return result as bigint
  }

  private async getMinBidAmount(): Promise<bigint> {
    const result = await readContract(config, {
      address: CoreContracts.LogicConstituent.address,
      abi: CoreContracts.LogicConstituent.abi as unknown as Abi,
      functionName: 'getMinBidAmount',
      args: []
    })
    return result as bigint
  }

  private async getMaxBidAmount(): Promise<bigint> {
    const result = await readContract(config, {
      address: CoreContracts.LogicConstituent.address,
      abi: CoreContracts.LogicConstituent.abi as unknown as Abi,
      functionName: 'getMaxBidAmount',
      args: []
    })
    return result as bigint
  }
} 