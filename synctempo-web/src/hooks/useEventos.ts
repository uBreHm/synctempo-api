import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { atualizarEvento, criarEvento, excluirEvento, listarEventos, obterEvento } from '../api/eventos'
import { buscarTodasPaginas } from '../api/paginacao'
import type { EventoRequest, EventoResponse } from '../types/evento'
import { chaves } from './chaves'

/**
 * Todos os eventos de cada calendário, uma consulta por calendário.
 * A API não filtra por período, então a tela recorta a semana depois.
 */
export function useEventosDosCalendarios(calendarioIds: number[]) {
  return useQueries({
    queries: calendarioIds.map((calendarioId) => ({
      queryKey: chaves.eventos(calendarioId),
      queryFn: () => buscarTodasPaginas((page, size) => listarEventos(calendarioId, page, size)),
    })),
  })
}

export function useEvento(calendarioId: number, id: number, placeholder?: EventoResponse) {
  return useQuery({
    queryKey: chaves.evento(calendarioId, id),
    queryFn: () => obterEvento(calendarioId, id),
    placeholderData: placeholder,
  })
}

interface SalvarEvento {
  calendarioId: number
  /** Ausente para criar. */
  id?: number
  request: EventoRequest
}

export function useSalvarEvento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ calendarioId, id, request }: SalvarEvento) =>
      id === undefined ? criarEvento(calendarioId, request) : atualizarEvento(calendarioId, id, request),
    onSuccess: (evento) => {
      queryClient.setQueryData(chaves.evento(evento.calendarioId, evento.id), evento)
      return queryClient.invalidateQueries({ queryKey: chaves.eventos(evento.calendarioId) })
    },
  })
}

export function useExcluirEvento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ calendarioId, id }: { calendarioId: number; id: number }) => excluirEvento(calendarioId, id),
    onSuccess: (_, { calendarioId, id }) => {
      queryClient.removeQueries({ queryKey: chaves.evento(calendarioId, id) })
      return queryClient.invalidateQueries({ queryKey: chaves.eventos(calendarioId) })
    },
  })
}
