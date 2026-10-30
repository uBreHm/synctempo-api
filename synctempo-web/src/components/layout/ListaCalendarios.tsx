import { useId, type CSSProperties } from 'react'
import { Link } from 'react-router'
import type { ParticipacaoResponse } from '../../types/membro'
import { ROTULO_PAPEL } from '../../utils/rotulos'
import estilos from './ListaCalendarios.module.css'

interface Props {
  calendarios: ParticipacaoResponse[]
  ocultos: Set<number>
  aoAlternar: (calendarioId: number) => void
}

export function ListaCalendarios({ calendarios, ocultos, aoAlternar }: Props) {
  const idTitulo = useId()
  return (
    <section aria-labelledby={idTitulo} className={estilos.lista}>
      <h2 id={idTitulo}>Meus calendários</h2>
      <ul>
        {calendarios.map((calendario) => (
          <li key={calendario.calendarioId} className={estilos.item}>
            <label className={estilos.marcar}>
              <input
                type="checkbox"
                checked={!ocultos.has(calendario.calendarioId)}
                onChange={() => aoAlternar(calendario.calendarioId)}
                style={{ '--cor-marcador': calendario.cor } as CSSProperties}
              />
              <span className={estilos.nome}>{calendario.nome}</span>
            </label>
            <span className={estilos.papel}>{ROTULO_PAPEL[calendario.papel]}</span>
            <Link
              to={`/calendarios/${calendario.calendarioId}`}
              className={estilos.configurar}
              aria-label={`Configurar ${calendario.nome}`}
            >
              Configurar
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
