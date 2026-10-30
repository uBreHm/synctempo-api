import type { Instant } from './comum'

/** auth/dto/request/LoginRequest */
export interface LoginRequest {
  email: string
  password: string
}

/** auth/dto/request/RegisterRequest */
export interface RegisterRequest {
  name: string
  email: string
  password: string
}

/** auth/dto/response/LoginResponse */
export interface LoginResponse {
  token: string
  tokenType: string
  expiresAt: Instant
}
