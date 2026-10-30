import type { UsuarioAdminPageResponse } from '../types/admin'
import { requisitar } from './client'

export function listarUsuarios(page: number, size: number) {
  return requisitar<UsuarioAdminPageResponse>('/admin/usuarios', { query: { page, size } })
}

export function reativarUsuario(id: number) {
  return requisitar<void>(`/admin/usuarios/${id}/ativar`, { method: 'PATCH' })
}
