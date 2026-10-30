import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { entrar as apiEntrar, obterContaAutenticada } from '../../api/auth'
import { definirAoExpirarSessao } from '../../api/client'
import { limparSessao, salvarSessao, tokenAtual } from '../../api/sessao'
import { chaves } from '../../hooks/chaves'
import { SessaoContexto, type Sessao } from '../../hooks/useSessao'
import type { LoginRequest } from '../../types/auth'

export function SessaoProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [autenticado, setAutenticado] = useState(() => tokenAtual() !== null)
  const [expirou, setExpirou] = useState(false)

  useEffect(() => {
    definirAoExpirarSessao(() => {
      setAutenticado(false)
      setExpirou(true)
    })
  }, [])

  const conta = useQuery({
    queryKey: chaves.contaAutenticada,
    queryFn: obterContaAutenticada,
    enabled: autenticado,
  })

  const entrar = useCallback(
    async (request: LoginRequest) => {
      const resposta = await apiEntrar(request)
      salvarSessao(resposta)
      // Descarta dados em cache de uma sessão anterior.
      queryClient.clear()
      setExpirou(false)
      setAutenticado(true)
    },
    [queryClient],
  )

  const sair = useCallback(() => {
    limparSessao()
    queryClient.clear()
    setExpirou(false)
    setAutenticado(false)
  }, [queryClient])

  const sessao = useMemo<Sessao>(
    () => ({ autenticado, expirou, usuario: autenticado ? conta.data : undefined, entrar, sair }),
    [autenticado, expirou, conta.data, entrar, sair],
  )

  return <SessaoContexto.Provider value={sessao}>{children}</SessaoContexto.Provider>
}
