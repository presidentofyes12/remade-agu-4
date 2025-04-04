import { useEffect, useState } from 'react'
import { useAccount, useConnect } from 'wagmi'
import { metaMask } from 'wagmi/connectors'
import { Button } from './ui/button'
import { Progress } from './ui/progress'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { CONTRACT_CONFIGS } from '@/contracts/config'
import { contractService } from '@/lib/wagmi'

interface InitializationError {
  address: string
  error: string
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { isConnected } = useAccount()
  const { connect, error: connectError, isPending, status } = useConnect()
  const [initializationProgress, setInitializationProgress] = useState(0)
  const [errors, setErrors] = useState<InitializationError[]>([])
  const [isInitializing, setIsInitializing] = useState(false)
  const [hasMetaMask, setHasMetaMask] = useState<boolean | null>(null)

  useEffect(() => {
    // Check if MetaMask is available
    const checkMetaMask = async () => {
      try {
        // Safe check for ethereum provider
        const provider = typeof window !== 'undefined' ? 
          (window as any).ethereum : undefined

        const isMetaMaskAvailable = provider && provider.isMetaMask
        console.log('MetaMask availability check:', { isMetaMaskAvailable, provider })
        setHasMetaMask(!!isMetaMaskAvailable)
      } catch (error) {
        console.error('Error checking MetaMask:', error)
        setHasMetaMask(false)
      }
    }
    checkMetaMask()
  }, [])

  useEffect(() => {
    const initializeContracts = async () => {
      if (!isConnected) return
      
      setIsInitializing(true)
      const totalContracts = CONTRACT_CONFIGS.length
      let initialized = 0
      const newErrors: InitializationError[] = []

      try {
        for (const config of CONTRACT_CONFIGS) {
          try {
            await contractService.initializeContract(config)
            initialized++
            setInitializationProgress((initialized / totalContracts) * 100)
          } catch (error) {
            console.error(`Failed to initialize contract ${config.address}:`, error)
            newErrors.push({
              address: config.address,
              error: error instanceof Error ? error.message : 'Unknown error occurred'
            })
          }
        }
      } catch (error) {
        console.error('Failed to initialize contracts:', error)
      } finally {
        setErrors(newErrors)
        setIsInitializing(false)
      }
    }

    if (isConnected) {
      initializeContracts()
    }

    return () => {
      contractService.cleanup()
    }
  }, [isConnected])

  const handleConnect = async () => {
    try {
      await connect({ 
        connector: metaMask()
      })
    } catch (error) {
      console.error('Failed to connect:', error)
    }
  }

  // Show loading state while checking MetaMask
  if (hasMetaMask === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Checking Wallet...</h1>
        <Progress value={undefined} className="w-[60%] mb-4" />
      </div>
    )
  }

  // Show MetaMask not found message
  if (!hasMetaMask) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">MetaMask Required</h1>
        <Alert>
          <AlertTitle>MetaMask Not Found</AlertTitle>
          <AlertDescription>
            Please install MetaMask to use this application.
            <a 
              href="https://metamask.io/download/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600 ml-1"
            >
              Download MetaMask
            </a>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Connect Wallet</h1>
        {connectError && (
          <Alert variant="destructive">
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription>
              {connectError.message}
            </AlertDescription>
          </Alert>
        )}
        <Button 
          onClick={handleConnect}
          size="lg"
          className="gap-2 mt-4"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Progress value={undefined} className="w-4 h-4" />
              Connecting...
            </>
          ) : (
            <>
              <img src="/metamask.svg" alt="MetaMask" className="w-6 h-6" />
              Connect MetaMask
            </>
          )}
        </Button>
      </div>
    )
  }

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Initializing Contracts</h1>
        <Progress value={initializationProgress} className="w-[60%] mb-4" />
        <p className="text-sm text-gray-500">
          {Math.round(initializationProgress)}% complete
        </p>
      </div>
    )
  }

  if (errors.length > 0) {
    return (
      <div className="p-4 space-y-4">
        <h1 className="text-2xl font-bold mb-4">Initialization Errors</h1>
        {errors.map((error, index) => (
          <Alert variant="destructive" key={index}>
            <AlertTitle>Error initializing contract</AlertTitle>
            <AlertDescription>
              {error.address}: {error.error}
            </AlertDescription>
          </Alert>
        ))}
        <Button onClick={() => window.location.reload()} className="mt-4">
          Retry Connection
        </Button>
      </div>
    )
  }

  return <>{children}</>
} 