import { 
  DAOTokenABI, 
  ConceptMappingABI,
  ConceptValuesABI,
  LogicConstituentABI,
  StateConstituentABI,
  ViewConstituentABI,
  TripartiteProxyABI,
  TripartiteComputationsABI,
  CONTRACT_ADDRESSES 
} from '@/contracts/abis'
import { createPublicClient, http, createWalletClient, type WalletClient } from 'viem'
import { pulsechain } from '@/lib/chains'
import { LocalContractCache, DAOState, ConceptState, PendingTransaction } from '@/contracts/abi-types'
import { getAccount, getWalletClient, getPublicClient } from '@wagmi/core'
import { config } from '@/lib/wagmi'

// Create public client for reading
const publicClient = getPublicClient(config) ?? createPublicClient({
  chain: pulsechain,
  transport: http()
})

// Local contract state cache
const localContractCache: LocalContractCache = {}

// Sync interval in milliseconds (5 minutes)
const SYNC_INTERVAL = 5 * 60 * 1000

export class ContractService {
  private static instance: ContractService
  private localCache: LocalContractCache = {}
  private syncInterval: number = 5000 // 5 seconds
  private syncTimeouts: { [address: string]: NodeJS.Timeout } = {}

  private constructor() {
    // Initialize local cache from storage
    const savedCache = localStorage.getItem('contract-cache')
    if (savedCache) {
      this.localCache = JSON.parse(savedCache)
    }
  }

  static getInstance(): ContractService {
    if (!ContractService.instance) {
      ContractService.instance = new ContractService()
    }
    return ContractService.instance
  }

  // Get wallet client
  private static async getWalletClient(): Promise<WalletClient> {
    const walletClient = await getWalletClient(config)
    if (!walletClient) {
      throw new Error('No wallet connected')
    }
    return walletClient
  }

  // Initialize contract state
  static async initializeContractState(address: string): Promise<void> {
    if (!localContractCache[address]) {
      localContractCache[address] = {
        state: await this.fetchContractState(address),
        lastSync: Date.now(),
        pendingTxs: []
      }
    }
  }

  // Fetch full contract state from chain
  private static async fetchContractState(address: string): Promise<DAOState | ConceptState> {
    try {
      // Determine contract type and fetch appropriate state
      if (address === CONTRACT_ADDRESSES.DAO_TOKEN) {
        const [name, description, totalSupply, members] = await Promise.all([
          this.readContract<string>({ address, abi: DAOTokenABI, functionName: 'name' }),
          this.readContract<string>({ address, abi: DAOTokenABI, functionName: 'description' }),
          this.readContract<bigint>({ address, abi: DAOTokenABI, functionName: 'totalSupply' }),
          this.readContract<string[]>({ address, abi: DAOTokenABI, functionName: 'getMembers' })
        ])

        return {
          name,
          description,
          totalSupply,
          members,
          proposals: [] // Fetch proposals if needed
        }
      } else if (address === CONTRACT_ADDRESSES.CONCEPT_VALUES || 
                 address === CONTRACT_ADDRESSES.CONCEPT_MAPPING) {
        const [id, name, description, values] = await Promise.all([
          this.readContract<string>({ address, abi: ConceptValuesABI, functionName: 'getId' }),
          this.readContract<string>({ address, abi: ConceptValuesABI, functionName: 'getName' }),
          this.readContract<string>({ address, abi: ConceptValuesABI, functionName: 'getDescription' }),
          this.readContract<string[]>({ address, abi: ConceptValuesABI, functionName: 'getValues' })
        ])

        return {
          id,
          name,
          description,
          values
        }
      }

      throw new Error('Unsupported contract type')
    } catch (error) {
      console.error('Error fetching contract state:', error)
      throw error
    }
  }

  // Check if state needs sync
  private static async checkAndSync(address: string): Promise<void> {
    const cache = localContractCache[address]
    if (!cache || Date.now() - cache.lastSync > SYNC_INTERVAL) {
      await this.syncContractState(address)
    }
  }

  // Sync contract state
  private static async syncContractState(address: string): Promise<void> {
    try {
      const newState = await this.fetchContractState(address)
      
      // Apply any pending transactions to the new state
      const finalState = this.applyPendingTransactions(address, newState)
      
      localContractCache[address] = {
        state: finalState,
        lastSync: Date.now(),
        pendingTxs: localContractCache[address]?.pendingTxs || []
      }
    } catch (error) {
      console.error('Error syncing contract state:', error)
      throw error
    }
  }

  // Apply pending transactions to state
  private static applyPendingTransactions(address: string, state: DAOState | ConceptState): DAOState | ConceptState {
    const pendingTxs = localContractCache[address]?.pendingTxs || []
    let currentState = { ...state }

    for (const tx of pendingTxs) {
      // Apply transaction effects to state based on method
      switch (tx.method) {
        case 'createDao':
          if ('name' in currentState) {
            const [name, description, supply] = tx.args
            currentState = {
              ...currentState,
              name,
              description,
              totalSupply: supply
            }
          }
          break
        case 'joinDao':
          if ('members' in currentState) {
            const [newMember] = tx.args
            currentState.members = [...currentState.members, newMember]
          }
          break
        // Add other method cases as needed
      }
    }

    return currentState
  }

  // Read from contract with local-first approach
  static async readContract<T>({ 
    address, 
    abi, 
    functionName, 
    args = [] 
  }: {
    address: string
    abi: any
    functionName: string
    args?: any[]
  }): Promise<T> {
    // Initialize state if needed
    await this.initializeContractState(address)
    
    // Check if we need to sync
    await this.checkAndSync(address)
    
    // Try to read from local state first
    const localState = localContractCache[address]?.state
    if (localState && this.canReadFromLocalState(functionName, localState)) {
      return this.readFromLocalState(functionName, localState, args)
    }

    // Fallback to chain read
    try {
      const result = await publicClient.readContract({
        address: address as `0x${string}`,
        abi,
        functionName,
        args,
      })
      
      return result as T
    } catch (error) {
      console.error('Contract read error:', error)
      throw error
    }
  }

  // Check if we can read from local state
  private static canReadFromLocalState(functionName: string, state: DAOState | ConceptState): boolean {
    const readableFunctions = ['name', 'description', 'totalSupply', 'members']
    return readableFunctions.includes(functionName)
  }

  // Read from local state
  private static readFromLocalState(functionName: string, state: DAOState | ConceptState, args: any[]): any {
    if (functionName in state) {
      return state[functionName as keyof typeof state]
    }
    throw new Error(`Cannot read ${functionName} from local state`)
  }

  // Write to contract with local validation and optimistic updates
  static async writeContract({ 
    address, 
    abi, 
    functionName, 
    args = [],
    localValidation
  }: {
    address: string
    abi: any
    functionName: string
    args?: any[]
    localValidation?: (args: any[]) => boolean
  }) {
    // Initialize state if needed
    await this.initializeContractState(address)

    // Perform local validation if provided
    if (localValidation && !localValidation(args)) {
      throw new Error('Local validation failed')
    }

    try {
      // Add to pending transactions
      const pendingTx: PendingTransaction = {
        hash: '', // Will be updated after submission
        method: functionName,
        args,
        timestamp: Date.now()
      }

      // Optimistically update local state
      const currentState = localContractCache[address].state
      const updatedState = this.applyPendingTransactions(address, currentState)

      // Get the current account and wallet client
      const account = getAccount(config)
      if (!account?.address) {
        throw new Error('No wallet connected')
      }

      const walletClient = await this.getWalletClient()
      
      // Submit transaction
      const { request } = await publicClient.simulateContract({
        account: account.address,
        address: address as `0x${string}`,
        abi,
        functionName,
        args,
      })

      const hash = await walletClient.writeContract(request)

      // Update pending transaction with hash
      pendingTx.hash = hash
      localContractCache[address].pendingTxs.push(pendingTx)

      // Wait for transaction
      const receipt = await publicClient.waitForTransactionReceipt({ hash })

      // Remove from pending transactions and sync state
      localContractCache[address].pendingTxs = localContractCache[address].pendingTxs
        .filter(tx => tx.hash !== hash)
      
      await this.syncContractState(address)

      return receipt
    } catch (error) {
      console.error('Contract write error:', error)
      // Revert local state on error
      await this.syncContractState(address)
      throw error
    }
  }

  // Specific methods for DAO operations
  static async createDao(name: string, description: string, initialSupply: bigint) {
    return this.writeContract({
      address: CONTRACT_ADDRESSES.DAO_TOKEN,
      abi: DAOTokenABI,
      functionName: 'createDao',
      args: [name, description, initialSupply],
      localValidation: ([name, description, supply]) => {
        return name.length >= 3 && 
               description.length >= 10 && 
               supply > 0n
      }
    })
  }

  static async joinDao(daoAddress: string) {
    return this.writeContract({
      address: CONTRACT_ADDRESSES.DAO_TOKEN,
      abi: DAOTokenABI,
      functionName: 'joinDao',
      args: [daoAddress],
      localValidation: ([address]) => {
        return /^0x[a-fA-F0-9]{40}$/.test(address)
      }
    })
  }

  static async getDaoName(daoAddress: string): Promise<string> {
    return this.readContract({
      address: daoAddress,
      abi: DAOTokenABI,
      functionName: 'name',
    })
  }

  // Cache management
  static clearCache() {
    Object.keys(localContractCache).forEach(address => {
      delete localContractCache[address]
    })
  }

  static invalidateCacheFor(address: string) {
    delete localContractCache[address]
  }
} 