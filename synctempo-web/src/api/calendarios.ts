import type { CalendarioResponse, CriarCalendarioRequest } from '../types/calendario'
import { requisitar } from './client'

export function criarCalendario(request: CriarCalendarioRequest) {
  return requisitar<CalendarioResponse>('/calendarios', { method: 'POST', body: request })
}

export function obterCalendario(id: number) {
  return requisitar<CalendarioResponse>(`/calendarios/${id}`)
}

export function atualizarCalendario(id: number, request: CriarCalendarioRequest) {
  return requisitar<CalendarioResponse>(`/calendarios/${id}`, { method: 'PUT', body: request })
}

export function excluirCalendario(id: number) {
  return requisitar<void>(`/calendarios/${id}`, { method: 'DELETE' })
}
