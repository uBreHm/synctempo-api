import type { LocalDateTime, PageResponse } from './comum'
import type { PapelCalendario } from './enums'

/** membro/dto/request/AdicionarMembroRequest */
export interface AdicionarMembroRequest {
  email: string
  papel: PapelCalendario
}

/** membro/dto/request/AlterarPapelRequest */
export interface AlterarPapelRequest {
  papel: PapelCalendario
}

/** membro/dto/response/MembroResponse */
export interface MembroResponse {
  id: number
  usuarioId: number
  nome: string
  email: string
  papel: PapelCalendario
  entrouEm: LocalDateTime
}

/** membro/dto/response/MembroPageResponse */
export type MembroPageResponse = PageResponse<MembroResponse>

/** membro/dto/response/ParticipacaoResponse */
export interface ParticipacaoResponse {
  calendarioId: number
  nome: string
  descricao: string | null
  cor: string
  papel: PapelCalendario
}

/** membro/dto/response/ParticipacaoPageResponse */
export type ParticipacaoPageResponse = PageResponse<ParticipacaoResponse>
