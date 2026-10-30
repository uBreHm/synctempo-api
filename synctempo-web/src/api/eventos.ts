import type { EventoPageResponse, EventoRequest, EventoResponse } from '../types/evento'
import { requisitar } from './client'

export function listarEventos(calendarioId: number, page: number, size: number) {
  return requisitar<EventoPageResponse>(`/calendarios/${calendarioId}/eventos`, {
    query: { page, size },
  })
}

export function obterEvento(calendarioId: number, id: number) {
  return requisitar<EventoResponse>(`/calendarios/${calendarioId}/eventos/${id}`)
}

export function criarEvento(calendarioId: number, request: EventoRequest) {
  return requisitar<EventoResponse>(`/calendarios/${calendarioId}/eventos`, {
    method: 'POST',
    body: request,
  })
}

export function atualizarEvento(calendarioId: number, id: number, request: EventoRequest) {
  return requisitar<EventoResponse>(`/calendarios/${calendarioId}/eventos/${id}`, {
    method: 'PUT',
    body: request,
  })
}

export function excluirEvento(calendarioId: number, id: number) {
  return requisitar<void>(`/calendarios/${calendarioId}/eventos/${id}`, { method: 'DELETE' })
}
