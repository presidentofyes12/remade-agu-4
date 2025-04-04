import { Address, type Abi } from 'viem'
import { ensureAbiArray } from '../utils/abiHelper'

// Contract ABIs
import ConceptValuesABI from './abis/ConceptValues.json'
import ConceptMappingABI from './abis/ConceptMapping.json'
import TripartiteComputationsABI from './abis/TripartiteComputations.json'
import DAOTokenABI from './abis/DAOToken.json'
import LogicConstituentABI from './abis/LogicConstituent.json'
import StateConstituentABI from './abis/StateConstituent.json'
import ViewConstituentABI from './abis/ViewConstituent.json'
import TripartiteProxyABI from './abis/TripartiteProxy.json'

// Verified Contract Addresses provided by user
export const CoreContracts = {
  ConceptValues: '0xbabf5c0170339814D17f31Ed4198557E4fd92C58' as Address,
  ConceptMapping: '0xE02894B878Eb424037C151b840C1db6Fde7Dec1e' as Address,
  TripartiteComputations: '0x500E4ce4592051f8005e1313f0e9aB25aE43E0e3' as Address,
  DaoToken: '0x28692ce06b9EB38a8b4D07FED172ba5c3403745b' as Address,
  LogicConstituent: '0xdd7eC040D5C2A15FFF30a5F7B004d888747Fa903' as Address,
  StateConstituent: '0xE24C734260189dd58618A95619EfF4164f98CC78' as Address,
  ViewConstituent: '0x2F2af46ae41ABEA5c3D8A50289d2b326D657a689' as Address,
  TripartiteProxy: '0xfBDB056Ac097EbB399065aeAd2375A2dAEE33731' as Address,
};

// You might want to add checks here to ensure addresses are loaded correctly,
// especially if reading from environment variables:
Object.entries(CoreContracts).forEach(([key, value]) => {
  if (!value || value === '0x...' as Address) { // Check for placeholder or undefined
    console.warn(`Contract address for ${key} is not defined or is a placeholder.`);
    // Potentially throw an error or handle default
  }
});

// Contract ABIs
export const ConceptValues = {
  address: CoreContracts.ConceptValues,
  abi: ensureAbiArray(ConceptValuesABI)
}

export const ConceptMapping = {
  address: CoreContracts.ConceptMapping,
  abi: ensureAbiArray(ConceptMappingABI)
}

export const TripartiteComputations = {
  address: CoreContracts.TripartiteComputations,
  abi: ensureAbiArray(TripartiteComputationsABI)
}

export const DAOToken = {
  address: CoreContracts.DaoToken,
  abi: ensureAbiArray(DAOTokenABI)
}

export const LogicConstituent = {
  address: CoreContracts.LogicConstituent,
  abi: ensureAbiArray(LogicConstituentABI)
}

export const StateConstituent = {
  address: CoreContracts.StateConstituent,
  abi: ensureAbiArray(StateConstituentABI)
}

export const ViewConstituent = {
  address: CoreContracts.ViewConstituent,
  abi: ensureAbiArray(ViewConstituentABI)
}

export const TripartiteProxy = {
  address: CoreContracts.TripartiteProxy,
  abi: ensureAbiArray(TripartiteProxyABI)
}

// Contract System Groups
export const ProxySystem = {
  TripartiteProxy
}

export const ConceptSystem = {
  ConceptMapping,
  ConceptValues,
  TripartiteComputations
} 