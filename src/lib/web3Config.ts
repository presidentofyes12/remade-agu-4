import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { http } from 'viem'
import { pulsechain } from 'viem/chains'

export const config = getDefaultConfig({
  appName: 'AGU DAO',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
  chains: [pulsechain],
  transports: {
    [pulsechain.id]: http(import.meta.env.VITE_RPC_URL),
  },
}) 