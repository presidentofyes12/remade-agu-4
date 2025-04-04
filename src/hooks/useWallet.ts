import { useAccount, useConnect, useDisconnect, useEnsName } from 'wagmi'

export function useWallet() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isLoading, pendingConnector } = useConnect()
  const { disconnect } = useDisconnect()
  const { data: ensName } = useEnsName({ address })

  const displayName = ensName || `${address?.slice(0, 6)}...${address?.slice(-4)}`

  return {
    address,
    isConnected,
    connect,
    connectors,
    disconnect,
    isLoading,
    pendingConnector,
    displayName
  }
} 