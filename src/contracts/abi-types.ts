export interface ContractABI {
  readonly abi: readonly object[]
  readonly bytecode: string
}

// Contract state interfaces
export interface DAOState {
  name: string
  description: string
  totalSupply: bigint
  members: string[]
  proposals: any[] // Can be expanded based on your needs
}

export interface ConceptState {
  id: string
  name: string
  description: string
  values: string[]
}

// Local cache types
export interface LocalContractCache {
  [address: string]: {
    state: DAOState | ConceptState
    lastSync: number
    pendingTxs: PendingTransaction[]
  }
}

export interface PendingTransaction {
  hash: string
  method: string
  args: any[]
  timestamp: number
}

export interface ContractReadConfig {
  address: string
  abi: ContractABI['abi']
  functionName: string
  args?: any[]
}

export interface ContractWriteConfig extends ContractReadConfig {
  localValidation?: (args: any[]) => boolean
} 