import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { atualizarCategoria, criarCategoria, excluirCategoria, listarCategorias } from '../api/categorias'
import { buscarTodasPaginas } from '../api/paginacao'
import type { CategoriaRequest } from '../types/categoria'
import { chaves } from './chaves'

export function useCategorias(calendarioId: number | undefined) {
  return useQuery({
    queryKey: chaves.categorias(calendarioId ?? 0),
    queryFn: () => buscarTodasPaginas((page, size) => listarCategorias(calendarioId!, page, size)),
    enabled: calendarioId !== undefined,
  })
}

// Eventos trazem as categorias embutidas, então mudanças em categorias também
// invalidam os eventos do calendário.
function useInvalidarCategorias() {
  const queryClient = useQueryClient()
  return (calendarioId: number) =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: chaves.categorias(calendarioId) }),
      queryClient.invalidateQueries({ queryKey: chaves.eventos(calendarioId) }),
    ])
}

interface SalvarCategoria {
  calendarioId: number
  /** Ausente para criar. */
  id?: number
  request: CategoriaRequest
}

export function useSalvarCategoria() {
  const invalidar = useInvalidarCategorias()
  return useMutation({
    mutationFn: ({ calendarioId, id, request }: SalvarCategoria) =>
      id === undefined ? criarCategoria(calendarioId, request) : atualizarCategoria(calendarioId, id, request),
    onSuccess: (_, { calendarioId }) => invalidar(calendarioId),
  })
}

export function useExcluirCategoria() {
  const invalidar = useInvalidarCategorias()
  return useMutation({
    mutationFn: ({ calendarioId, id }: { calendarioId: number; id: number }) => excluirCategoria(calendarioId, id),
    onSuccess: (_, { calendarioId }) => invalidar(calendarioId),
  })
}
