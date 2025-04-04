/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_RPC_URL: string
  readonly VITE_CHAIN_ID: string
  readonly VITE_WALLETCONNECT_PROJECT_ID: string
  readonly VITE_CONTRACT_TRIPARTITE_PROXY: string
  readonly VITE_CONTRACT_VIEW_CONSTITUENT: string
  readonly VITE_CONTRACT_STATE_CONSTITUENT: string
  readonly VITE_CONTRACT_LOGIC_CONSTITUENT: string
  readonly VITE_CONTRACT_DAO_TOKEN: string
  readonly VITE_CONTRACT_CONCEPT_MAPPING: string
  readonly VITE_CONTRACT_CONCEPT_VALUES: string
  readonly VITE_CONTRACT_TRIPARTITE_COMPUTATIONS: string
  readonly VITE_NOSTR_RELAY_1: string
  readonly VITE_NOSTR_RELAY_2: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 