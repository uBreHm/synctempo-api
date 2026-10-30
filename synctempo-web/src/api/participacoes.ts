import type { ParticipacaoPageResponse } from '../types/membro'
import { requisitar } from './client'

export function listarMinhasParticipacoes(page: number, size: number) {
  return requisitar<ParticipacaoPageResponse>('/usuarios/me/calendarios', { query: { page, size } })
}
