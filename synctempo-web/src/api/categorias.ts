import type { CategoriaPageResponse, CategoriaRequest, CategoriaResponse } from '../types/categoria'
import { requisitar } from './client'

export function listarCategorias(calendarioId: number, page: number, size: number) {
  return requisitar<CategoriaPageResponse>(`/calendarios/${calendarioId}/categorias`, {
    query: { page, size },
  })
}

export function criarCategoria(calendarioId: number, request: CategoriaRequest) {
  return requisitar<CategoriaResponse>(`/calendarios/${calendarioId}/categorias`, {
    method: 'POST',
    body: request,
  })
}

export function atualizarCategoria(calendarioId: number, id: number, request: CategoriaRequest) {
  return requisitar<CategoriaResponse>(`/calendarios/${calendarioId}/categorias/${id}`, {
    method: 'PUT',
    body: request,
  })
}

export function excluirCategoria(calendarioId: number, id: number) {
  return requisitar<void>(`/calendarios/${calendarioId}/categorias/${id}`, { method: 'DELETE' })
}
