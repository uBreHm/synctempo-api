import type { CSSProperties } from 'react'
import type { EventoResponse } from '../../types/evento'
import type { ParticipacaoResponse } from '../../types/membro'
import { formatarHora } from '../../utils/datas'
import estilos from './BlocoEvento.module.css'

export interface EventoNaGrade {
  evento: EventoResponse
  calendario: ParticipacaoResponse
}

interface Props {
  item: EventoNaGrade
  aoAbrir: (item: EventoNaGrade) => void
  /** Posição na coluna do dia; ausente para eventos de dia inteiro. */
  posicao?: CSSProperties
}

export function BlocoEvento({ item, aoAbrir, posicao }: Props) {
  const { evento, calendario } = item
  const horario =
    !evento.diaInteiro && evento.horaInicio && evento.horaFim
      ? `${formatarHora(evento.horaInicio)} – ${formatarHora(evento.horaFim)}`
      : null

  return (
    <button
      type="button"
      className={posicao ? estilos.bloco : estilos.blocoDiaInteiro}
      style={{ ...posicao, '--cor-calendario': calendario.cor } as CSSProperties}
      onClick={() => aoAbrir(item)}
    >
      <span className={estilos.titulo}>{evento.titulo}</span>
      {horario && <span className={estilos.horario}>{horario}</span>}
      <span className="sr-only">, {calendario.nome}</span>
    </button>
  )
}
