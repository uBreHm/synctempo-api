import { useQuery } from '@tanstack/react-query'
import { buscarTodasPaginas } from '../api/paginacao'
import { listarMinhasParticipacoes } from '../api/participacoes'
import { chaves } from './chaves'

/** Calendários da conta com o papel em cada um (todas as páginas). */
export function useParticipacoes() {
  return useQuery({
    queryKey: chaves.participacoes,
    queryFn: () => buscarTodasPaginas(listarMinhasParticipacoes),
  })
}
