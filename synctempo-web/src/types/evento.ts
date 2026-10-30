import type { CategoriaResponse } from './categoria'
import type { LocalDate, LocalTime, PageResponse } from './comum'
import type { Visibilidade } from './enums'

/** evento/dto/request/EventoRequest (usado no POST e no PUT) */
export interface EventoRequest {
  titulo: string
  descricao: string | null
  localizacao: string | null
  linkReuniao: string | null
  dataEvento: LocalDate
  horaInicio: LocalTime | null
  horaFim: LocalTime | null
  diaInteiro: boolean
  visibilidade: Visibilidade
  categoriaIds: number[] | null
}

/** evento/dto/response/EventoResponse */
export interface EventoResponse {
  id: number
  calendarioId: number
  criadoPorId: number
  titulo: string
  descricao: string | null
  localizacao: string | null
  linkReuniao: string | null
  dataEvento: LocalDate
  horaInicio: LocalTime | null
  horaFim: LocalTime | null
  diaInteiro: boolean
  visibilidade: Visibilidade
  categorias: CategoriaResponse[]
}

/** evento/dto/response/EventoPageResponse */
export type EventoPageResponse = PageResponse<EventoResponse>
