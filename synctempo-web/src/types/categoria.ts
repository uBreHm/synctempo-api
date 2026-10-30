import type { PageResponse } from './comum'

/** categoria/dto/request/CategoriaRequest */
export interface CategoriaRequest {
  nome: string
  cor: string
}

/** categoria/dto/response/CategoriaResponse */
export interface CategoriaResponse {
  id: number
  nome: string
  cor: string
}

/** categoria/dto/response/CategoriaPageResponse */
export type CategoriaPageResponse = PageResponse<CategoriaResponse>
