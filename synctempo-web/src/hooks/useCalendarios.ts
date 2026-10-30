import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { atualizarCalendario, criarCalendario, excluirCalendario, obterCalendario } from '../api/calendarios'
import type { CriarCalendarioRequest } from '../types/calendario'
import { chaves } from './chaves'

export function useCalendario(id: number) {
  return useQuery({ queryKey: chaves.calendario(id), queryFn: () => obterCalendario(id) })
}

export function useCriarCalendario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: CriarCalendarioRequest) => criarCalendario(request),
    onSuccess: (calendario) => {
      queryClient.setQueryData(chaves.calendario(calendario.id), calendario)
      return queryClient.invalidateQueries({ queryKey: chaves.participacoes })
    },
  })
}

export function useAtualizarCalendario(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: CriarCalendarioRequest) => atualizarCalendario(id, request),
    onSuccess: (calendario) => {
      queryClient.setQueryData(chaves.calendario(id), calendario)
      return queryClient.invalidateQueries({ queryKey: chaves.participacoes })
    },
  })
}

export function useExcluirCalendario(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => excluirCalendario(id),
    onSuccess: () => {
      for (const queryKey of [chaves.calendario(id), chaves.eventos(id), chaves.categorias(id), chaves.membros(id)]) {
        queryClient.removeQueries({ queryKey })
      }
      return queryClient.invalidateQueries({ queryKey: chaves.participacoes })
    },
  })
}
