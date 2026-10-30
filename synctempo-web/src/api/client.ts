import type { ApiError } from '../types/comum'
import { limparSessao, tokenAtual } from './sessao'

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080').replace(/\/+$/, '')

/** Falha devolvida pela API ({ code, message }) ou falha de rede (status 0). */
export class ApiErro extends Error {
  readonly status: number
  readonly code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.name = 'ApiErro'
    this.status = status
    this.code = code
  }
}

let aoExpirarSessao: () => void = () => {}

/** Registrado pelo SessaoProvider: chamado quando uma rota protegida responde 401. */
export function definirAoExpirarSessao(callback: () => void): void {
  aoExpirarSessao = callback
}

type Metodo = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface Opcoes {
  method?: Metodo
  body?: unknown
  query?: Record<string, string | number | undefined>
  /** false para rotas públicas (login e cadastro). */
  autenticar?: boolean
  /**
   * false quando o 401 da rota não significa sessão expirada.
   * Ex.: PUT /usuarios/me/senha responde 401 para senha atual incorreta.
   */
  expirarSessaoEm401?: boolean
}

export async function requisitar<T>(caminho: string, opcoes: Opcoes = {}): Promise<T> {
  const { method = 'GET', body, query, autenticar = true, expirarSessaoEm401 = true } = opcoes

  const url = new URL(BASE_URL + caminho)
  for (const [chave, valor] of Object.entries(query ?? {})) {
    if (valor !== undefined && valor !== '') url.searchParams.set(chave, String(valor))
  }

  const headers: Record<string, string> = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const token = autenticar ? tokenAtual() : null
  if (token) headers.Authorization = `Bearer ${token}`

  let resposta: Response
  try {
    resposta = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiErro(0, 'NETWORK_ERROR', 'Sem resposta da API')
  }

  if (!resposta.ok) {
    const erro = await erroDaResposta(resposta)
    if (resposta.status === 401 && autenticar && expirarSessaoEm401) {
      limparSessao()
      aoExpirarSessao()
    }
    throw erro
  }
  if (resposta.status === 204) return undefined as T
  return (await resposta.json()) as T
}

async function erroDaResposta(resposta: Response): Promise<ApiErro> {
  try {
    const corpo = (await resposta.json()) as Partial<ApiError>
    if (typeof corpo.code === 'string' && typeof corpo.message === 'string') {
      return new ApiErro(resposta.status, corpo.code, corpo.message)
    }
  } catch {
    // Corpo vazio ou fora do formato ApiError.
  }
  return new ApiErro(resposta.status, String(resposta.status), resposta.statusText)
}
