import type { PageResponse } from '../types/comum'

/** Maior `size` aceito pelas listas da API. */
export const TAMANHO_MAXIMO_PAGINA = 100

/**
 * Percorre todas as páginas de uma lista. Usado onde a API não oferece filtro
 * (ex.: eventos por período) e a tela precisa do conjunto inteiro.
 */
export async function buscarTodasPaginas<T>(
  buscarPagina: (page: number, size: number) => Promise<PageResponse<T>>,
): Promise<T[]> {
  const itens: T[] = []
  for (let page = 0; ; page += 1) {
    const resposta = await buscarPagina(page, TAMANHO_MAXIMO_PAGINA)
    itens.push(...resposta.data)
    if (page + 1 >= resposta.totalPages) return itens
  }
}
