/** usuario/dto/response/UsuarioResponse */
export interface UsuarioResponse {
  id: number
  name: string
  email: string
}

/** usuario/dto/request/AtualizarUsuarioRequest */
export interface AtualizarUsuarioRequest {
  name: string
  email: string
}

/** usuario/dto/request/AlterarSenhaRequest */
export interface AlterarSenhaRequest {
  currentPassword: string
  newPassword: string
}
