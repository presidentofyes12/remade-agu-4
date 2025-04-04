import { describe, it, expect, beforeEach, vi } from 'vitest'
// import { readContract } from '@wagmi/core' // No longer mocking readContract directly
import { calculateBidImpact } from '../math'
import { MathematicalValidator } from '../validator'
import { BidValidator } from '../bidValidator'
import { CoreContracts, LogicConstituent } from '../../contracts/deployments'
import { Abi } from 'viem'
import { getConceptForLocation, derivePatternFromConcept } from '../conceptUtils'
import { type Address, isAddress, isAddressEqual } from 'viem'
// import { config } from '../../config/wagmi' // No longer needed for mocks

// Remove wagmi/core mock
// vi.mock('@wagmi/core', ...) 

// Keep math mock
vi.mock('../math', () => {
  const mockCalculateBidImpact = vi.fn().mockImplementation(async (amount: bigint, price: bigint, allocation: bigint): Promise<bigint> => {
    if (allocation === 0n) return 0n;
    return (amount * price * 100n) / allocation;
  });
  return {
    calculateBidImpact: mockCalculateBidImpact,
  };
});

// Keep simple MathematicalValidator mock
vi.mock('../validator', () => ({
  MathematicalValidator: {
    validateTransaction: vi.fn().mockResolvedValue({ success: true, result: true, isValid: true, error: undefined })
  }
}))

describe('BidValidator', () => {
  let bidValidator: BidValidator
  const mockDailyAllocation = 1000n;
  const mockMinBid = 10n;
  const mockMaxBid = 500n;

  beforeEach(() => {
    vi.restoreAllMocks();
    bidValidator = new BidValidator()

    // Spy on private methods directly
    // @ts-ignore
    vi.spyOn(bidValidator, 'getDailyAllocation').mockResolvedValue(mockDailyAllocation);
    // @ts-ignore
    vi.spyOn(bidValidator, 'getMinBidAmount').mockResolvedValue(mockMinBid);
    // @ts-ignore
    vi.spyOn(bidValidator, 'getMaxBidAmount').mockResolvedValue(mockMaxBid);
  })

  describe('validateBid', () => {
    it('should validate a bid within limits', async () => {
        const amount = 100n;
        const price = 1n;
        const result = await bidValidator.validateBid(amount, price);
        expect(result.isValid).toBe(true);
        const { calculateBidImpact: mockedImpactFn } = await vi.importActual<typeof import('../math')>('../math');
        const expectedImpact = await mockedImpactFn(amount, price, mockDailyAllocation);
        expect(result.impact).toBe(expectedImpact);
        expect(result.dailyAllocation).toBe(mockDailyAllocation); // Value comes from spied method
    });

    it('should reject a bid exceeding daily allocation', async () => {
        const amount = mockDailyAllocation + 1n;
        const price = 1n;
        const result = await bidValidator.validateBid(amount, price);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Bid amount exceeds daily allocation limit');
        expect(result.dailyAllocation).toBe(mockDailyAllocation); // Value comes from spied method
    });
  })

  describe('validateBidLimits', () => {
    // These should now pass as they rely on the spied methods
    it('should validate a bid within min/max limits', async () => {
        const amount = mockMinBid + 1n;
        const price = 1n;
        const result = await bidValidator.validateBidLimits(amount, price);
        expect(result.isValid).toBe(true);
    });
    it('should reject a bid below minimum amount', async () => {
        const amount = mockMinBid - 1n;
        const price = 1n;
        const result = await bidValidator.validateBidLimits(amount, price);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe(`Bid amount must be at least ${mockMinBid}`);
    });
    it('should reject a bid above maximum amount', async () => {
        const amount = mockMaxBid + 1n;
        const price = 1n;
        const result = await bidValidator.validateBidLimits(amount, price);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe(`Bid amount cannot exceed ${mockMaxBid}`);
    });
  })

  describe('simulateBid', () => {
    // Test assumes MathematicalValidator mock returns success
    it('should calculate impact and return success', async () => {
      const amount = 100n;
      const price = 1n;
      const result = await bidValidator.simulateBid(amount, price);
      const { calculateBidImpact: mockedImpactFn } = await vi.importActual<typeof import('../math')>('../math');
      const expectedImpact = await mockedImpactFn(amount, price, mockDailyAllocation);
      expect(result.success).toBe(true);
      expect(result.impact).toBe(expectedImpact);
      expect(result.error).toBeUndefined();
      // Basic check that validator was called, without checking complex args
      expect(MathematicalValidator.validateTransaction).toHaveBeenCalledOnce();
    });
  });

  describe('validateConceptualBid', () => {
     // Test assumes MathematicalValidator mock returns success
    it('should return valid if conceptual alignment is met', async () => {
      const locationId = 10;
      const slotId = 3;
      const conceptValue = getConceptForLocation(locationId);
      const expectedPattern = derivePatternFromConcept(conceptValue, slotId);
      const patternValue = expectedPattern;
      const durationMs = 1000n;
      const result = await bidValidator.validateConceptualBid(locationId, slotId, patternValue, durationMs);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
      // Basic check that validator was called
      expect(MathematicalValidator.validateTransaction).toHaveBeenCalledOnce();
    });

    it('should return invalid if patternValue deviates too much', async () => {
       const locationId = 10;
       const slotId = 3;
       const conceptValue = getConceptForLocation(locationId);
       const expectedPattern = derivePatternFromConcept(conceptValue, slotId);
       const patternValue = expectedPattern + 100n; // Deviates
       const durationMs = 1000n;
       const result = await bidValidator.validateConceptualBid(locationId, slotId, patternValue, durationMs);
       expect(result.isValid).toBe(false);
       expect(result.error).toContain('deviates too much from expected pattern');
        // Basic check that validator was called
       expect(MathematicalValidator.validateTransaction).toHaveBeenCalledOnce();
    });

    it('should return valid if patternValue is within allowed deviation', async () => {
        const locationId = 10;
        const slotId = 3;
        const conceptValue = getConceptForLocation(locationId);
        const expectedPattern = derivePatternFromConcept(conceptValue, slotId);
        const allowedDeviation = 5n;
        const patternValue = expectedPattern - 3n; // Within deviation
        const durationMs = 1000n;
        const result = await bidValidator.validateConceptualBid(locationId, slotId, patternValue, durationMs, allowedDeviation);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
        // Basic check that validator was called
        expect(MathematicalValidator.validateTransaction).toHaveBeenCalledOnce();
    });
  });
}); 