import { createConfig } from 'wagmi'
import { pulsechain } from './chains'
import { ContractService } from '@/services/ContractService'
import { http } from 'viem'
import { metaMask } from 'wagmi/connectors'

// Initialize contract service
const contractService = ContractService.getInstance()

// Configure wagmi client
const config = createConfig({
  chains: [pulsechain],
  connectors: [
    metaMask()
  ],
  ssr: false,
  transports: {
    [pulsechain.id]: http('https://rpc.pulsechain.com')
  }
})

// Export contract service instance and config
export { contractService, config } 