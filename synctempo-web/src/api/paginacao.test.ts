import { describe, expect, it, vi } from 'vitest'
import type { PageResponse } from '../types/comum'
import { buscarTodasPaginas, TAMANHO_MAXIMO_PAGINA } from './paginacao'

function pagina(data: number[], page: number, totalPages: number): PageResponse<number> {
  return { data, page, size: TAMANHO_MAXIMO_PAGINA, totalItems: data.length, totalPages }
}

describe('buscarTodasPaginas', () => {
  it('faz uma única chamada quando a lista está vazia', async () => {
    const buscar = vi.fn().mockResolvedValue(pagina([], 0, 0))
    await expect(buscarTodasPaginas(buscar)).resolves.toEqual([])
    expect(buscar).toHaveBeenCalledTimes(1)
  })

  it('percorre todas as páginas com o tamanho máximo e junta os itens em ordem', async () => {
    const buscar = vi.fn((page: number) =>
      Promise.resolve(pagina([page * 10 + 1, page * 10 + 2], page, 3)),
    )
    await expect(buscarTodasPaginas(buscar)).resolves.toEqual([1, 2, 11, 12, 21, 22])
    expect(buscar.mock.calls).toEqual([
      [0, TAMANHO_MAXIMO_PAGINA],
      [1, TAMANHO_MAXIMO_PAGINA],
      [2, TAMANHO_MAXIMO_PAGINA],
    ])
  })
})
