import type { AlterarSenhaRequest, AtualizarUsuarioRequest, UsuarioResponse } from '../types/usuario'
import { requisitar } from './client'

export function obterMinhaConta() {
  return requisitar<UsuarioResponse>('/usuarios/me')
}

export function atualizarMinhaConta(request: AtualizarUsuarioRequest) {
  return requisitar<UsuarioResponse>('/usuarios/me', { method: 'PUT', body: request })
}

export function alterarMinhaSenha(request: AlterarSenhaRequest) {
  return requisitar<void>('/usuarios/me/senha', {
    method: 'PUT',
    body: request,
    expirarSessaoEm401: false,
  })
}

export function desativarMinhaConta() {
  return requisitar<void>('/usuarios/me', { method: 'DELETE' })
}
