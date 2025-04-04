import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ContractService } from '../ContractService'
// import { mockAbi } from './mockAbi' // Removed mock import
import type { ContractConfig } from '../../contracts/types'
import { type WalletClient, type Address } from 'viem'
import { ViewConstituent } from '../../contracts/deployments' // Import actual config

describe('ContractService', () => {
  let service: ContractService

  // Use actual config, potentially modifying sync settings for tests
  const mockConfig: ContractConfig = {
    ...ViewConstituent, // Spread the actual config
    syncConfig: {
      syncInterval: 10000, // Adjust interval for testing if needed
      maxRetries: 3,
      retryDelay: 1000,
      simulateBeforeWrite: true
    }
  }

  beforeEach(() => {
    // Reset mocks and service instance before each test
    vi.restoreAllMocks();
    // @ts-ignore // Access private static property for reset
    ContractService.instance = null;
    service = ContractService.getInstance()
    localStorage.clear()

    // Mock the public client to prevent actual network calls
    // Note: Specific mocks might be needed per test case
    vi.spyOn(service['publicClient'], 'readContract').mockImplementation(async () => {
      // console.log('Mock readContract called');
      return 'mock read result' // Default mock result
    });
    vi.spyOn(service['publicClient'], 'simulateContract').mockImplementation(async () => {
        // console.log('Mock simulateContract called');
        return { request: { data: '0xmock' } } as any; // Mock simulation result
    });
    vi.spyOn(service['publicClient'], 'watchEvent').mockImplementation(() => {
      // console.log('Mock watchEvent called');
      return () => {}; // Return a mock unsubscribe function
    });

    // Mock wallet client if needed for write tests - Directly set the private property
    const mockWalletClient = {
        account: { address: '0xMockAddress' as Address },
        writeContract: vi.fn().mockResolvedValue('0xMockTxHash' as Address),
    } as unknown as WalletClient;
    // @ts-ignore - Access private property for testing
    service['walletClient'] = mockWalletClient; 
    // service.setWalletClient(mockWalletClient); // Removed this line

  })

  afterEach(() => {
    service.cleanup()
    vi.restoreAllMocks();
  })

  describe('initialization', () => {
    it('should initialize with default state', () => {
      expect(service).toBeDefined()
      expect(service).toBeInstanceOf(ContractService)
    })

    it('should initialize contracts with proper configuration', async () => {
      await service.initializeContract(mockConfig)

      // Access private store for verification
      // @ts-ignore
      const store = service['localStore'][mockConfig.address];
      expect(store).toBeDefined()
      expect(store?.isInitialized).toBe(true)
      expect(store?.abi).toBeDefined()
      expect(store?.abi).toEqual(ViewConstituent.abi)
      expect(service['syncIntervals'][mockConfig.address]).toBeDefined(); // Check interval was set
    })

    it('should handle initialization errors gracefully', async () => {
      const invalidConfig = {
        address: '0xinvalid' as Address,
        abi: [],
        syncConfig: { ...mockConfig.syncConfig }
      }
      // Ensure the error is thrown for invalid address
      await expect(service.initializeContract(invalidConfig as ContractConfig)).rejects.toThrow(/Invalid address format/);

      const invalidAbiConfig = {
        address: ViewConstituent.address,
        abi: null as any,
        syncConfig: { ...mockConfig.syncConfig }
      }
      // Ensure the error is thrown for invalid ABI
      await expect(service.initializeContract(invalidAbiConfig as ContractConfig)).rejects.toThrow(/Invalid ABI format/);
    })
  })

  describe('local storage', () => {
    it('should save and load state from localStorage', async () => {
      await service.initializeContract(mockConfig)

      const stored = JSON.parse(localStorage.getItem('contractStore') || '{}')
      expect(stored[mockConfig.address]).toBeDefined()
      expect(stored[mockConfig.address].isInitialized).toBe(true)
    })

    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage.setItem to throw an error
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
      setItemSpy.mockImplementation(() => {
        throw new Error('Storage error')
      })

      // Should not throw when saving fails
      expect(() => {
        service.cleanup()
      }).not.toThrow()
    })
  })

  describe('contract operations', () => {
    it('should handle read operations with local-first approach', async () => {
      await service.initializeContract(mockConfig)

      // Mock the public client to simulate network calls
      const mockResult = 'test result'
      const readSpy = vi.spyOn(service['publicClient'], 'readContract')
      readSpy.mockResolvedValue(mockResult)

      const result = await service.readContract(mockConfig.address, 'testFunction')
      expect(result).toBe(mockResult)
    })

    it('should handle write operations with simulation', async () => {
      await service.initializeContract(mockConfig)

      // Mock the wallet client
      const mockWalletClient = {
        writeContract: vi.fn()
      } as unknown as WalletClient
      
      // Set the mock wallet client
      service['walletClient'] = mockWalletClient

      // Mock the public client to simulate network calls
      const mockHash = '0x123'
      const simulateSpy = vi.spyOn(service['publicClient'], 'simulateContract')
      simulateSpy.mockResolvedValue({
        request: {
          abi: ViewConstituent.abi,
          address: mockConfig.address,
          functionName: 'testWrite',
          args: ['test']
        }
      })

      // Mock the wallet client's writeContract method
      const writeSpy = vi.spyOn(mockWalletClient, 'writeContract')
      writeSpy.mockResolvedValue(mockHash as `0x${string}`)

      const result = await service.writeContract(mockConfig.address, 'testWrite', ['test'])
      expect(result).toBe(mockHash)
    })
  })

  describe('cleanup', () => {
    it('should clear intervals and subscriptions', async () => {
      await service.initializeContract(mockConfig)

      service.cleanup()

      // Verify that intervals and subscriptions are cleared
      expect(service['syncIntervals']).toEqual({})
      expect(service['eventSubscriptions']).toEqual({})
    })
  })
}) 