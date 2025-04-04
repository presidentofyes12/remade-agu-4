import { type Abi } from 'viem'

export interface ContractState<T = unknown> {
  lastSync: number
  pendingTxs: PendingTransaction[]
  data: Record<string, T>
  abi: Abi
  isInitialized: boolean
  events: ContractEvent[]
  localTransactions: PendingTransaction[]
  simulatedState: Record<string, T>
}

export interface ContractEvent {
  id: string
  blockNumber: number
  transactionHash: string
  event: string
  args: Record<string, unknown>
  timestamp: number
  logIndex: number
  data?: string
  topics?: string[]
}

export interface PendingTransaction {
  hash: string
  functionName: string
  args: unknown[]
  timestamp: number
  status: 'pending' | 'success' | 'failed'
  error?: string
}

export interface LocalContractStore {
  [address: string]: ContractState
}

export interface SyncConfig {
  syncInterval: number
  maxRetries: number
  retryDelay: number
  simulateBeforeWrite: boolean
  validateState?: (state: Record<string, unknown>) => boolean
}

export interface ContractConfig {
  address: string
  abi: Abi
  syncConfig?: SyncConfig
  initialState?: Record<string, unknown>
}

export interface ContractCallConfig {
  functionName: string
  args?: unknown[]
  localFirst?: boolean
  validateLocal?: (value: unknown) => boolean
}

export interface ContractWriteConfig {
  functionName: string
  args?: unknown[]
  simulateOnly?: boolean
}

// Contract addresses
export const CONTRACT_ADDRESSES = {
  CONCEPT_VALUES: '0xbabf5c0170339814D17f31Ed4198557E4fd92C58' as `0x${string}`,
  CONCEPT_MAPPING: '0xE02894B878Eb424037C151b840C1db6Fde7Dec1e' as `0x${string}`,
  TRIPARTITE_COMPUTATIONS: '0x500E4ce4592051f8005e1313f0e9aB25aE43E0e3' as `0x${string}`,
  DAO_TOKEN: '0x28692ce06b9EB38a8b4D07FED172ba5c3403745b' as `0x${string}`,
  LOGIC_CONSTITUENT: '0xdd7eC040D5C2A15FFF30a5F7B004d888747Fa903' as `0x${string}`,
  STATE_CONSTITUENT: '0xE24C734260189dd58618A95619EfF4164f98CC78' as `0x${string}`,
  VIEW_CONSTITUENT: '0x2F2af46ae41ABEA5c3D8A50289d2b326D657a689' as `0x${string}`,
  TRIPARTITE_PROXY: '0xfBDB056Ac097EbB399065aeAd2375A2dAEE33731' as `0x${string}`
} as const

// Default sync configuration
export const DEFAULT_SYNC_CONFIG: SyncConfig = {
  syncInterval: 10000, // 10 seconds
  maxRetries: 3,
  retryDelay: 1000,
  simulateBeforeWrite: true,
  validateState: (state) => Object.keys(state).length > 0
} 