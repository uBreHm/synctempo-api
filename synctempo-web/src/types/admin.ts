import type { PageResponse } from './comum'
import type { PerfilGlobal } from './enums'

/** admin/dto/response/UsuarioAdminResponse */
export interface UsuarioAdminResponse {
  id: number
  nome: string
  email: string
  perfil: PerfilGlobal
  ativo: boolean
}

/** admin/dto/response/UsuarioAdminPageResponse */
export type UsuarioAdminPageResponse = PageResponse<UsuarioAdminResponse>
