// Formatos de data e hora usados pela API (Jackson + java.time).

/** java.time.LocalDate: "YYYY-MM-DD", sem fuso. */
export type LocalDate = string

/** java.time.LocalTime: a API devolve "HH:mm:ss" e aceita "HH:mm". Sem fuso. */
export type LocalTime = string

/** java.time.Instant: ISO-8601 em UTC, terminado em "Z". */
export type Instant = string

/** java.time.LocalDateTime: "YYYY-MM-DDTHH:mm:ss.fffffffff", sem fuso. */
export type LocalDateTime = string

/** br.com.synctempo.api.dto.response.ApiError */
export interface ApiError {
  code: string
  message: string
}

/** Formato comum dos records *PageResponse da API. */
export interface PageResponse<T> {
  data: T[]
  page: number
  size: number
  totalItems: number
  totalPages: number
}
