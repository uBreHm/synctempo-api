import { createContext, useContext } from 'react'
import type { LoginRequest } from '../types/auth'
import type { UsuarioResponse } from '../types/usuario'

export interface Sessao {
  autenticado: boolean
  /** true quando a sessão terminou por um 401 da API (token expirado ou inválido). */
  expirou: boolean
  /** Dados de GET /auth/me; undefined enquanto carregam. */
  usuario: UsuarioResponse | undefined
  entrar: (request: LoginRequest) => Promise<void>
  sair: () => void
}

export const SessaoContexto = createContext<Sessao | null>(null)

export function useSessao(): Sessao {
  const sessao = useContext(SessaoContexto)
  if (!sessao) throw new Error('useSessao precisa estar dentro de SessaoProvider')
  return sessao
}
