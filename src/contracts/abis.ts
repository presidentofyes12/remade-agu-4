// Contract Addresses from environment variables
export const CONTRACT_ADDRESSES = {
  CONCEPT_VALUES: import.meta.env.VITE_CONTRACT_CONCEPT_VALUES as `0x${string}`,
  CONCEPT_MAPPING: import.meta.env.VITE_CONTRACT_CONCEPT_MAPPING as `0x${string}`,
  TRIPARTITE_COMPUTATIONS: import.meta.env.VITE_CONTRACT_TRIPARTITE_COMPUTATIONS as `0x${string}`,
  DAO_TOKEN: import.meta.env.VITE_CONTRACT_DAO_TOKEN as `0x${string}`,
  LOGIC_CONSTITUENT: import.meta.env.VITE_CONTRACT_LOGIC_CONSTITUENT as `0x${string}`,
  STATE_CONSTITUENT: import.meta.env.VITE_CONTRACT_STATE_CONSTITUENT as `0x${string}`,
  VIEW_CONSTITUENT: import.meta.env.VITE_CONTRACT_VIEW_CONSTITUENT as `0x${string}`,
  TRIPARTITE_PROXY: import.meta.env.VITE_CONTRACT_TRIPARTITE_PROXY as `0x${string}`
} as const

import { type Abi } from 'viem'
import { ensureAbiArray } from '../utils/abiHelper'

// Import ABIs
import ConceptValuesABI from './abis/ConceptValues.json'
import ConceptMappingABI from './abis/ConceptMapping.json'
import TripartiteComputationsABI from './abis/TripartiteComputations.json'
import DAOTokenABI from './abis/DAOToken.json'
import LogicConstituentABI from './abis/LogicConstituent.json'
import StateConstituentABI from './abis/StateConstituent.json'
import ViewConstituentABI from './abis/ViewConstituent.json'
import TripartiteProxyABI from './abis/TripartiteProxy.json'

// Export ABIs with proper formatting
export const ConceptValuesABIFormatted = ensureAbiArray(ConceptValuesABI)
export const ConceptMappingABIFormatted = ensureAbiArray(ConceptMappingABI)
export const TripartiteComputationsABIFormatted = ensureAbiArray(TripartiteComputationsABI)
export const DAOTokenABIFormatted = ensureAbiArray(DAOTokenABI)
export const LogicConstituentABIFormatted = ensureAbiArray(LogicConstituentABI)
export const StateConstituentABIFormatted = ensureAbiArray(StateConstituentABI)
export const ViewConstituentABIFormatted = ensureAbiArray(ViewConstituentABI)
export const TripartiteProxyABIFormatted = ensureAbiArray(TripartiteProxyABI)

// Export everything
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