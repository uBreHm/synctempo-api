import type { LoginRequest, LoginResponse, RegisterRequest } from '../types/auth'
import type { UsuarioResponse } from '../types/usuario'
import { requisitar } from './client'

export function entrar(request: LoginRequest) {
  return requisitar<LoginResponse>('/auth/login', { method: 'POST', body: request, autenticar: false })
}

export function cadastrar(request: RegisterRequest) {
  return requisitar<UsuarioResponse>('/auth/register', { method: 'POST', body: request, autenticar: false })
}

export function obterContaAutenticada() {
  return requisitar<UsuarioResponse>('/auth/me')
}
