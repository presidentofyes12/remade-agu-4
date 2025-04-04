import { createConfig, http } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

// Define custom chain for PulseChain
const pulsechain = {
  id: 369,
  name: 'PulseChain',
  network: 'pulsechain',
  nativeCurrency: {
    name: 'Pulse',
    symbol: 'PLS',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.pulsechain.com'],
    },
    public: {
      http: ['https://rpc.pulsechain.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'PulseScan',
      url: 'https://scan.pulsechain.com',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 14353601,
    },
  },
} as const

export const config = createConfig({
  chains: [pulsechain, mainnet],
  connectors: [
    injected()
  ],
  transports: {
    [pulsechain.id]: http('https://rpc.pulsechain.com'),
    [mainnet.id]: http()
  }
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
} 