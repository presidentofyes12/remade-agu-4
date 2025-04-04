import { Chain } from 'viem'

export const pulsechain = {
  id: 369,
  name: 'PulseChain',
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
  testnet: false,
} as const satisfies Chain 