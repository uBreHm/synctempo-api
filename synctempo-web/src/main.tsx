import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { ApiErro } from './api/client'
import { App } from './App'
import { SessaoProvider } from './components/sessao/SessaoProvider'
import './styles/tokens.css'
import './styles/global.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // Repete só falhas de rede ou do servidor; 4xx são respostas definitivas da API.
      retry: (falhas, erro) => erro instanceof ApiErro && (erro.status === 0 || erro.status >= 500) && falhas < 2,
    },
    mutations: { retry: false },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SessaoProvider>
          <App />
        </SessaoProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
