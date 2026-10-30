import type {
  AdicionarMembroRequest,
  AlterarPapelRequest,
  MembroPageResponse,
  MembroResponse,
} from '../types/membro'
import { requisitar } from './client'

export function listarMembros(calendarioId: number, busca: string, page: number, size: number) {
  return requisitar<MembroPageResponse>(`/calendarios/${calendarioId}/membros`, {
    query: { busca, page, size },
  })
}

export function adicionarMembro(calendarioId: number, request: AdicionarMembroRequest) {
  return requisitar<MembroResponse>(`/calendarios/${calendarioId}/membros`, {
    method: 'POST',
    body: request,
  })
}

export function alterarPapelMembro(calendarioId: number, id: number, request: AlterarPapelRequest) {
  return requisitar<MembroResponse>(`/calendarios/${calendarioId}/membros/${id}`, {
    method: 'PUT',
    body: request,
  })
}

export function removerMembro(calendarioId: number, id: number) {
  return requisitar<void>(`/calendarios/${calendarioId}/membros/${id}`, { method: 'DELETE' })
}
