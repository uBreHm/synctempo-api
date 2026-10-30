import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adicionarMembro, alterarPapelMembro, listarMembros, removerMembro } from '../api/membros'
import type { PapelCalendario } from '../types/enums'
import type { AdicionarMembroRequest } from '../types/membro'
import { chaves } from './chaves'

export const MEMBROS_POR_PAGINA = 20

export function useMembros(calendarioId: number, busca: string, page: number) {
  return useQuery({
    queryKey: chaves.membrosPagina(calendarioId, busca, page),
    queryFn: () => listarMembros(calendarioId, busca, page, MEMBROS_POR_PAGINA),
    placeholderData: keepPreviousData,
  })
}

// Mudanças de membros podem alterar o papel da própria conta, então a lista de
// participações também é recarregada.
function useInvalidarMembros() {
  const queryClient = useQueryClient()
  return (calendarioId: number) =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: chaves.membros(calendarioId) }),
      queryClient.invalidateQueries({ queryKey: chaves.participacoes }),
    ])
}

export function useAdicionarMembro(calendarioId: number) {
  const invalidar = useInvalidarMembros()
  return useMutation({
    mutationFn: (request: AdicionarMembroRequest) => adicionarMembro(calendarioId, request),
    onSuccess: () => invalidar(calendarioId),
  })
}

export function useAlterarPapel(calendarioId: number) {
  const invalidar = useInvalidarMembros()
  return useMutation({
    mutationFn: ({ id, papel }: { id: number; papel: PapelCalendario }) =>
      alterarPapelMembro(calendarioId, id, { papel }),
    onSuccess: () => invalidar(calendarioId),
  })
}

export function useRemoverMembro(calendarioId: number) {
  const invalidar = useInvalidarMembros()
  return useMutation({
    mutationFn: (id: number) => removerMembro(calendarioId, id),
    onSuccess: () => invalidar(calendarioId),
  })
}
