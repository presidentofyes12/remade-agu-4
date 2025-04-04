import { type Abi } from 'viem'
import { ContractConfig } from './types'

// Import ABIs
import ConceptValuesABI from './abis/ConceptValues.json'
import ConceptMappingABI from './abis/ConceptMapping.json'
import TripartiteComputationsABI from './abis/TripartiteComputations.json'
import DAOTokenABI from './abis/DAOToken.json'
import LogicConstituentABI from './abis/LogicConstituent.json'
import StateConstituentABI from './abis/StateConstituent.json'
import ViewConstituentABI from './abis/ViewConstituent.json'
import TripartiteProxyABI from './abis/TripartiteProxy.json'

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

// Contract configurations with proper typing
export const CONTRACT_CONFIGS: ContractConfig[] = [
  {
    address: CONTRACT_ADDRESSES.CONCEPT_VALUES,
    abi: ConceptValuesABI.abi as Abi,
    syncConfig: {
      syncInterval: 5000,
      maxRetries: 3,
      retryDelay: 1000,
      simulateBeforeWrite: true
    }
  },
  {
    address: CONTRACT_ADDRESSES.CONCEPT_MAPPING,
    abi: ConceptMappingABI.abi as Abi,
    syncConfig: {
      syncInterval: 5000,
      maxRetries: 3,
      retryDelay: 1000,
      simulateBeforeWrite: true
    }
  },
  {
    address: CONTRACT_ADDRESSES.TRIPARTITE_COMPUTATIONS,
    abi: TripartiteComputationsABI.abi as Abi,
    syncConfig: {
      syncInterval: 5000,
      maxRetries: 3,
      retryDelay: 1000,
      simulateBeforeWrite: true
    }
  },
  {
    address: CONTRACT_ADDRESSES.DAO_TOKEN,
    abi: DAOTokenABI.abi as Abi,
    syncConfig: {
      syncInterval: 5000,
      maxRetries: 3,
      retryDelay: 1000,
      simulateBeforeWrite: true
    }
  },
  {
    address: CONTRACT_ADDRESSES.LOGIC_CONSTITUENT,
    abi: LogicConstituentABI.abi as Abi,
    syncConfig: {
      syncInterval: 5000,
      maxRetries: 3,
      retryDelay: 1000,
      simulateBeforeWrite: true
    }
  },
  {
    address: CONTRACT_ADDRESSES.STATE_CONSTITUENT,
    abi: StateConstituentABI.abi as Abi,
    syncConfig: {
      syncInterval: 5000,
      maxRetries: 3,
      retryDelay: 1000,
      simulateBeforeWrite: true
    }
  },
  {
    address: CONTRACT_ADDRESSES.VIEW_CONSTITUENT,
    abi: ViewConstituentABI.abi as Abi,
    syncConfig: {
      syncInterval: 5000,
      maxRetries: 3,
      retryDelay: 1000,
      simulateBeforeWrite: true
    }
  },
  {
    address: CONTRACT_ADDRESSES.TRIPARTITE_PROXY,
    abi: TripartiteProxyABI.abi as Abi,
    syncConfig: {
      syncInterval: 5000,
      maxRetries: 3,
      retryDelay: 1000,
      simulateBeforeWrite: true
    }
  }
]

// Export ABIs for direct use
export {
  ConceptValuesABI,
  ConceptMappingABI,
  TripartiteComputationsABI,
  DAOTokenABI,
  LogicConstituentABI,
  StateConstituentABI,
  ViewConstituentABI,
  TripartiteProxyABI
} 