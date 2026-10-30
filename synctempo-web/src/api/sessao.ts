import type { LoginResponse } from '../types/auth'

const CHAVE = 'synctempo.sessao'

type SessaoArmazenada = Pick<LoginResponse, 'token' | 'expiresAt'>

// Usada só quando o sessionStorage está indisponível (ex.: bloqueado pelo navegador).
let sessaoEmMemoria: SessaoArmazenada | null = null

function lerArmazenada(): SessaoArmazenada | null {
  try {
    const bruto = sessionStorage.getItem(CHAVE)
    return bruto ? (JSON.parse(bruto) as SessaoArmazenada) : sessaoEmMemoria
  } catch {
    return sessaoEmMemoria
  }
}

/** Token ainda dentro de `expiresAt`, ou null. */
export function tokenAtual(): string | null {
  const sessao = lerArmazenada()
  if (!sessao) return null
  if (Date.parse(sessao.expiresAt) <= Date.now()) {
    limparSessao()
    return null
  }
  return sessao.token
}

export function salvarSessao({ token, expiresAt }: LoginResponse): void {
  const sessao: SessaoArmazenada = { token, expiresAt }
  try {
    sessionStorage.setItem(CHAVE, JSON.stringify(sessao))
  } catch {
    sessaoEmMemoria = sessao
  }
}

export function limparSessao(): void {
  sessaoEmMemoria = null
  try {
    sessionStorage.removeItem(CHAVE)
  } catch {
    // Nada armazenado.
  }
}
