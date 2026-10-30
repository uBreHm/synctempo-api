import type { PageResponse } from './comum'

/** calendario/dto/request/CriarCalendarioRequest (também usado no PUT) */
export interface CriarCalendarioRequest {
  nome: string
  descricao: string | null
  cor: string
}

/** calendario/dto/response/CalendarioResponse */
export interface CalendarioResponse {
  id: number
  nome: string
  descricao: string | null
  cor: string
  criadoPorId: number
}

/** calendario/dto/response/CalendarioPageResponse */
export type CalendarioPageResponse = PageResponse<CalendarioResponse>
