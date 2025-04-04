import { Button } from '@/components/ui/button'
import { useAccount } from 'wagmi'
import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/Input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { useWallet } from '../hooks/useWallet'

export function ConnectWallet() {
  const { 
    isConnected, 
    connect, 
    connectors, 
    disconnect, 
    isLoading, 
    pendingConnector,
    displayName 
  } = useWallet()

  if (isConnected) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm">{displayName}</span>
        <Button variant="outline" size="sm" onClick={() => disconnect()}>
          Disconnect
        </Button>
      </div>
    )
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Connect Wallet</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          {connectors.map((connector) => {
            const isInternetMoney = connector.id === 'injected' && 
              typeof window !== 'undefined' && 
              window.ethereum?.isInternetMoney

            return (
              <Button
                key={connector.id}
                onClick={() => connect({ connector })}
                disabled={isLoading && connector.id === pendingConnector?.id}
                className="w-full"
              >
                {isInternetMoney ? 'Internet Money' : connector.name}
                {isLoading && connector.id === pendingConnector?.id && " (connecting...)"}
              </Button>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
} 