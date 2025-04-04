import { type PublicClient, type WalletClient, type Hash, type Abi, type AbiFunction, parseAbiItem, decodeEventLog, createPublicClient, http, isAddress } from 'viem'
import { type ContractState, type ContractEvent, type PendingTransaction, type LocalContractStore, type ContractConfig } from '../contracts/types'
import { CONTRACT_CONFIGS } from '../contracts/config'

export class ContractService {
  private static instance: ContractService
  private publicClient: PublicClient
  private walletClient: WalletClient | null = null
  private localStore: LocalContractStore = {}
  private syncIntervals: Record<string, NodeJS.Timeout> = {}
  private eventSubscriptions: Record<string, () => void> = {}

  private constructor() {
    this.publicClient = createPublicClient({
      transport: http('https://rpc.pulsechain.com')
    })
    this.loadFromStorage()
  }

  public static getInstance(): ContractService {
    if (!ContractService.instance) {
      ContractService.instance = new ContractService()
    }
    return ContractService.instance
  }

  private async loadFromStorage() {
    try {
      const stored = localStorage.getItem('contractStore')
      if (stored) {
        this.localStore = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load contract store from storage:', error)
    }
  }

  private async saveToStorage() {
    try {
      if (!this.localStore) {
        console.warn('Local store is undefined, skipping save')
        return
      }
      
      // Validate the store before saving
      if (typeof this.localStore !== 'object') {
        throw new Error('Invalid local store format')
      }
      
      const serialized = JSON.stringify(this.localStore)
      if (!serialized) {
        throw new Error('Failed to serialize local store')
      }
      
      localStorage.setItem('contractStore', serialized)
    } catch (error) {
      console.error('Failed to save contract store to storage:', error)
      // Don't throw, but log the error with more context
      if (error instanceof Error) {
        console.error(`Storage error details: ${error.message}`)
      }
    }
  }

  public async initializeContract(config: ContractConfig): Promise<void> {
    const { address, abi, syncConfig } = config
    
    if (!isAddress(address)) {
      throw new Error(`Invalid address format: ${address}`)
    }

    if (!abi || !Array.isArray(abi)) {
      throw new Error(`Invalid ABI format for contract ${address}`)
    }

    if (!this.localStore[address]) {
      this.localStore[address] = {
        lastSync: 0,
        pendingTxs: [],
        data: {},
        abi,
        isInitialized: false,
        events: [],
        localTransactions: [],
        simulatedState: {}
      }
    }

    try {
      await this.syncContract(address)
      this.subscribeToEvents(address)

      if (syncConfig?.syncInterval) {
        // Clear any existing interval first
        if (this.syncIntervals[address]) {
          clearInterval(this.syncIntervals[address])
        }
        this.syncIntervals[address] = setInterval(
          () => this.syncContract(address).catch(err => 
            console.error(`Sync interval failed for ${address}:`, err)
          ),
          syncConfig.syncInterval
        )
      }

      this.localStore[address].isInitialized = true
      await this.saveToStorage()
    } catch (error) {
      console.error(`Failed to initialize contract ${address}:`, error)
      // Clean up any partial initialization
      delete this.localStore[address]
      await this.saveToStorage()
      throw error
    }
  }

  private async syncContract(address: string): Promise<void> {
    try {
      const contractState = this.localStore[address]
      if (!contractState) {
        throw new Error(`Contract ${address} not found in local store`)
      }

      // Fetch all readable functions from ABI
      const readableFunctions = contractState.abi.filter(
        (item): item is AbiFunction => 
          item.type === 'function' && 
          (item.stateMutability === 'view' || item.stateMutability === 'pure')
      )

      for (const func of readableFunctions) {
        try {
          const result = await this.fetchContractState(address, func.name)
          if (result !== undefined) {
            contractState.data[func.name] = result
          }
        } catch (error) {
          console.warn(`Failed to sync ${func.name} for contract ${address}:`, error)
          // Continue with other functions even if one fails
          continue
        }
      }

      contractState.lastSync = Date.now()
      await this.saveToStorage()
    } catch (error) {
      console.error(`Failed to sync contract ${address}:`, error)
      // Don't throw, just log the error and continue
    }
  }

  private async fetchContractState(address: string, functionName: string, args: unknown[] = []): Promise<unknown> {
    try {
      const result = await this.publicClient.readContract({
        address: address as `0x${string}`,
        abi: this.localStore[address].abi,
        functionName,
        args
      })
      return result
    } catch (error) {
      console.error(`Failed to read ${functionName} from contract ${address}:`, error)
      // Return undefined to allow fallback to local state
      return undefined
    }
  }

  private async subscribeToEvents(address: string) {
    const unwatch = this.publicClient.watchContractEvent({
      address: address as `0x${string}`,
      abi: this.localStore[address].abi as Abi,
      onLogs: async (logs) => {
        for (const log of logs) {
          if (!log.transactionHash) continue

          try {
            const decoded = decodeEventLog({
              abi: this.localStore[address].abi as Abi,
              data: log.data,
              topics: log.topics
            })

            const event: ContractEvent = {
              id: `${log.transactionHash}-${log.logIndex}`,
              blockNumber: Number(log.blockNumber),
              transactionHash: log.transactionHash,
              event: decoded.eventName || 'UnknownEvent',
              args: decoded.args ? Object.fromEntries(
                Object.entries(decoded.args).filter(([key]) => !key.match(/^\d+$/))
              ) : {},
              timestamp: Date.now(),
              logIndex: Number(log.logIndex),
              data: log.data,
              topics: log.topics
            }

            this.localStore[address].events.push(event)
            await this.saveToStorage()
          } catch (error) {
            console.error('Failed to decode event log:', error)
          }
        }
      }
    })

    this.eventSubscriptions[address] = unwatch
  }

  public async readContract(
    address: string,
    functionName: string,
    args: unknown[] = []
  ): Promise<unknown> {
    try {
      const contractState = this.localStore[address]
      if (!contractState?.isInitialized) {
        throw new Error(`Contract ${address} not initialized`)
      }

      // Try to get fresh data first
      try {
        const result = await this.fetchContractState(address, functionName, args)
        if (result !== undefined) {
          contractState.data[functionName] = result
          await this.saveToStorage()
          return result
        }
      } catch (error) {
        console.warn(`Failed to fetch fresh data for ${functionName}:`, error)
        // Fall back to local state
      }

      // Return local state if available
      if (functionName in contractState.data) {
        return contractState.data[functionName]
      }

      throw new Error(`No data available for function ${functionName} in contract ${address}`)
    } catch (error) {
      console.error(`Failed to read contract ${address}.${functionName}:`, error)
      throw error
    }
  }

  private getWalletClient(): WalletClient {
    if (!this.walletClient) {
      throw new Error('Wallet client not initialized')
    }
    return this.walletClient
  }

  public async writeContract(
    address: string,
    functionName: string,
    args: unknown[] = []
  ): Promise<Hash> {
    try {
      const walletClient = this.getWalletClient()
      const contractState = this.localStore[address]
      if (!contractState?.isInitialized) {
        throw new Error(`Contract ${address} not initialized`)
      }

      // Simulate the transaction first
      try {
        await this.simulateTransaction(address, functionName, args)
      } catch (error) {
        throw new Error(`Transaction simulation failed: ${error instanceof Error ? error.message : String(error)}`)
      }

      const hash = await walletClient.writeContract({
        address: address as `0x${string}`,
        abi: contractState.abi,
        functionName,
        args,
        chain: null,
        account: walletClient.account
      })

      // Add to pending transactions
      const pendingTx: PendingTransaction = {
        hash,
        functionName,
        args,
        timestamp: Date.now(),
        status: 'pending'
      }
      contractState.pendingTxs.push(pendingTx)

      await this.saveToStorage()
      return hash
    } catch (error) {
      console.error(`Failed to write to contract ${address}.${functionName}:`, error)
      // Revert any optimistic updates
      await this.syncContractState(address)
      throw error
    }
  }

  private async simulateTransaction(
    address: string,
    functionName: string,
    args: unknown[]
  ): Promise<void> {
    const contractState = this.localStore[address]
    
    try {
      const result = await this.publicClient.simulateContract({
        address: address as `0x${string}`,
        abi: contractState.abi as Abi,
        functionName,
        args
      })

      // Update simulated state if simulation succeeds
      this.localStore[address].simulatedState = {
        ...contractState.simulatedState,
        [functionName]: result
      }
    } catch (error) {
      console.error('Transaction simulation failed:', error)
      throw error
    }
  }

  public cleanup() {
    // Clear all sync intervals
    Object.values(this.syncIntervals).forEach(clearInterval)
    this.syncIntervals = {}

    // Unsubscribe from all events
    Object.values(this.eventSubscriptions).forEach(unsubscribe => unsubscribe())
    this.eventSubscriptions = {}

    // Save final state
    this.saveToStorage()
  }
}

export const contractService = ContractService.getInstance() 