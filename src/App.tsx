import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { WagmiConfig } from 'wagmi'
import { config } from './config/wagmi'
import { ThemeProvider } from './components/theme-provider'
import { Navigation } from './components/Navigation'
import { Toaster } from './components/ui/toaster'
import { WalletProvider } from './components/WalletProvider'
import { Progress } from './components/ui/progress'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import DashboardPage from './pages/DashboardPage'
import CreateDaoPage from './pages/CreateDaoPage'
import JoinDaoPage from './pages/JoinDaoPage'
import AdminPage from './pages/AdminPage'

const queryClient = new QueryClient()

if (import.meta.hot) {
  import.meta.hot.accept()
}

export function App() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    console.log('App initialization started')
    console.log('ViewConstituent Address (from env):', import.meta.env.VITE_CONTRACT_VIEW_CONSTITUENT)
  }, [])

  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Initializing Application</h1>
        <Progress value={undefined} className="w-[60%] mb-4" />
        <p className="text-sm text-gray-500">
          Please wait...
        </p>
      </div>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={config}>
        <ThemeProvider>
          <WalletProvider>
            <div className="relative flex min-h-screen flex-col">
              <Navigation />
              <div className="flex-1">
                <main className="container py-8">
                  <Routes>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/create" element={<CreateDaoPage />} />
                    <Route path="/join" element={<JoinDaoPage />} />
                    <Route path="/admin" element={<AdminPage />} />
                  </Routes>
                </main>
              </div>
              <Toaster />
            </div>
          </WalletProvider>
        </ThemeProvider>
      </WagmiConfig>
    </QueryClientProvider>
  )
} 