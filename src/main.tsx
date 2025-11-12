import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Reshaped } from 'reshaped'
import { trpc, trpcClient } from './lib/trpc-client'
import { initializeMockMode } from './lib/mock-mode'
import './themes/kadabra/theme.css'
import './styles/gradients.css'
import App from './App'
import './index.css'
import { getStoredValue, LOCAL_STORAGE_KEYS } from './utils/storage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh for 5 min
      gcTime: 10 * 60 * 1000, // 10 minutes - keep unused data in cache (formerly cacheTime)
    },
  },
})

initializeMockMode().catch((error) => {
  console.warn('Mock mode initialization failed:', error)
})

const storedColorMode = getStoredValue<string | null>(LOCAL_STORAGE_KEYS.colorMode, null)
const initialColorMode: 'light' | 'dark' =
  storedColorMode === 'light' || storedColorMode === 'dark' ? storedColorMode : 'dark'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <Reshaped theme="kadabra" defaultColorMode={initialColorMode}>
          <App />
        </Reshaped>
      </QueryClientProvider>
    </trpc.Provider>
  </React.StrictMode>,
)

