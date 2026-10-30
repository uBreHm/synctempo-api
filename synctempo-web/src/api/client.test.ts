import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiErro, definirAoExpirarSessao, requisitar } from './client'

function resposta(status: number, corpo?: unknown): Response {
  return new Response(corpo === undefined ? null : JSON.stringify(corpo), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('requisitar', () => {
  const aoExpirar = vi.fn()

  beforeEach(() => {
    aoExpirar.mockReset()
    definirAoExpirarSessao(aoExpirar)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('monta a URL com a base e a query, ignorando parâmetros vazios', async () => {
    const fetchFalso = vi.fn().mockResolvedValue(resposta(200, { data: [] }))
    vi.stubGlobal('fetch', fetchFalso)
    await requisitar('/calendarios/1/membros', { query: { busca: '', page: 0, size: 20 } })
    expect(String(fetchFalso.mock.calls[0]?.[0])).toBe('http://localhost:8080/calendarios/1/membros?page=0&size=20')
  })

  it('envia o corpo como JSON', async () => {
    const fetchFalso = vi.fn().mockResolvedValue(resposta(201, { id: 1 }))
    vi.stubGlobal('fetch', fetchFalso)
    const corpo = { nome: 'TCC 2026', descricao: null, cor: '#3366ff' }
    await requisitar('/calendarios', { method: 'POST', body: corpo })
    const init = fetchFalso.mock.calls[0]?.[1] as RequestInit
    expect(init.method).toBe('POST')
    expect(init.body).toBe(JSON.stringify(corpo))
    expect((init.headers as Record<string, string>)['Content-Type']).toBe('application/json')
  })

  it('devolve undefined para 204', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 204 })))
    await expect(requisitar('/calendarios/1', { method: 'DELETE' })).resolves.toBeUndefined()
  })

  it('converte o ApiError da API em ApiErro com status, code e message', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(resposta(409, { code: 'CONFLICT', message: 'O calendario precisa de pelo menos um ADMIN' })),
    )
    const erro = await requisitar('/calendarios/1/membros/2', { method: 'DELETE' }).catch((e: unknown) => e)
    expect(erro).toBeInstanceOf(ApiErro)
    expect(erro).toMatchObject({ status: 409, code: 'CONFLICT', message: 'O calendario precisa de pelo menos um ADMIN' })
  })

  it('trata falha de rede como status 0', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    await expect(requisitar('/auth/me')).rejects.toMatchObject({ status: 0 })
  })

  it('encerra a sessão quando uma rota protegida responde 401', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(resposta(401, { code: 'UNAUTHORIZED', message: 'Autenticacao obrigatoria' })),
    )
    await expect(requisitar('/usuarios/me/calendarios')).rejects.toBeInstanceOf(ApiErro)
    expect(aoExpirar).toHaveBeenCalledOnce()
  })

  it('não encerra a sessão no 401 do login nem no da troca de senha', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(() =>
        Promise.resolve(resposta(401, { code: 'UNAUTHORIZED', message: 'Credenciais invalidas' })),
      ),
    )
    await expect(requisitar('/auth/login', { method: 'POST', body: {}, autenticar: false })).rejects.toBeInstanceOf(ApiErro)
    await expect(
      requisitar('/usuarios/me/senha', { method: 'PUT', body: {}, expirarSessaoEm401: false }),
    ).rejects.toBeInstanceOf(ApiErro)
    expect(aoExpirar).not.toHaveBeenCalled()
  })
})
