import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { useAgora } from '../../hooks/useAgora'
import {
  formatarDataLonga,
  formatarDiaSemanaCurto,
  MINUTOS_NO_DIA,
  mesmoDia,
  minutosDe,
  minutosDoDia,
  paraLocalDate,
  paraLocalTime,
} from '../../utils/datas'
import { posicionarEventos, type Posicao } from '../../utils/layoutEventos'
import { BlocoEvento, type EventoNaGrade } from './BlocoEvento'
import estilos from './Grade.module.css'

/** Altura de uma hora na grade, em px. */
export const ALTURA_HORA = 48
const MINUTOS_POR_CELULA = 30
const CELULAS = MINUTOS_NO_DIA / MINUTOS_POR_CELULA
const HORA_INICIAL_VISIVEL = 7
/** Duração mínima desenhada, para o bloco continuar legível; também entra no cálculo de sobreposição. */
const DURACAO_MINIMA_DESENHADA = 25
/** Faixa livre à direita de cada dia, para ainda dar para clicar num horário ocupado. */
const MARGEM_DIREITA = '8px'

interface EventoComHorario {
  item: EventoNaGrade
  inicio: number
  fim: number
}

interface Props {
  dias: Date[]
  eventos: EventoNaGrade[]
  /** false quando a conta não pode criar eventos em nenhum calendário. */
  podeCriar: boolean
  /** `inicio` em minutos desde 00:00; null para evento de dia inteiro. */
  aoCriar: (dia: Date, inicio: number | null) => void
  aoAbrir: (item: EventoNaGrade) => void
  aoVerDia: (dia: Date) => void
}

export function Grade({ dias, eventos, podeCriar, aoCriar, aoAbrir, aoVerDia }: Props) {
  const agora = useAgora()
  const rolagemRef = useRef<HTMLDivElement>(null)
  const [foco, setFoco] = useState(() => ({
    dia: Math.max(0, dias.findIndex((dia) => mesmoDia(dia, new Date()))),
    celula: HORA_INICIAL_VISIVEL * 2,
  }))
  const diaFocado = Math.min(foco.dia, dias.length - 1)

  useLayoutEffect(() => {
    if (rolagemRef.current) rolagemRef.current.scrollTop = HORA_INICIAL_VISIVEL * ALTURA_HORA
  }, [])

  const colunas = useMemo(
    () =>
      dias.map((dia) => {
        const chave = paraLocalDate(dia)
        const semHorario: EventoNaGrade[] = []
        const comHorario: EventoComHorario[] = []
        for (const item of eventos) {
          const { dataEvento, diaInteiro, horaInicio, horaFim } = item.evento
          if (dataEvento !== chave) continue
          if (diaInteiro || !horaInicio || !horaFim) semHorario.push(item)
          else comHorario.push({ item, inicio: minutosDe(horaInicio), fim: minutosDe(horaFim) })
        }
        const posicoes = posicionarEventos(
          comHorario.map(({ item, inicio, fim }) => ({
            id: item.evento.id,
            inicio,
            fim: Math.max(fim, inicio + DURACAO_MINIMA_DESENHADA),
          })),
        )
        return { dia, semHorario, comHorario, posicoes }
      }),
    [dias, eventos],
  )

  function teclar(evento: KeyboardEvent<HTMLButtonElement>, dia: number, celula: number) {
    const destino = { dia, celula }
    switch (evento.key) {
      case 'ArrowUp':
        destino.celula -= 1
        break
      case 'ArrowDown':
        destino.celula += 1
        break
      case 'ArrowLeft':
        destino.dia -= 1
        break
      case 'ArrowRight':
        destino.dia += 1
        break
      case 'Home':
        destino.celula = 0
        break
      case 'End':
        destino.celula = CELULAS - 1
        break
      default:
        return
    }
    evento.preventDefault()
    destino.dia = Math.min(Math.max(destino.dia, 0), dias.length - 1)
    destino.celula = Math.min(Math.max(destino.celula, 0), CELULAS - 1)
    setFoco(destino)
    rolagemRef.current
      ?.querySelector<HTMLButtonElement>(`[data-celula="${destino.dia}-${destino.celula}"]`)
      ?.focus()
  }

  const estiloGrade = { '--dias': dias.length, '--altura-hora': `${ALTURA_HORA}px` } as CSSProperties

  return (
    <div ref={rolagemRef} className={estilos.rolagem} style={estiloGrade}>
      {podeCriar && (
        <p id="instrucoes-grade" className="sr-only">
          Use as setas para escolher um horário e Enter para criar um evento.
        </p>
      )}
      <div className={estilos.topo}>
        <div className={estilos.linha}>
          <div />
          {dias.map((dia) => {
            const ehHoje = mesmoDia(dia, agora)
            return (
              <div key={paraLocalDate(dia)} className={estilos.cabecalhoDia}>
                <span className={estilos.diaSemana} data-hoje={ehHoje}>
                  {formatarDiaSemanaCurto(dia)}
                </span>
                <button
                  type="button"
                  className={estilos.numeroDia}
                  data-hoje={ehHoje}
                  aria-current={ehHoje ? 'date' : undefined}
                  aria-label={`Ver o dia ${formatarDataLonga(dia)}`}
                  onClick={() => aoVerDia(dia)}
                >
                  {dia.getDate()}
                </button>
              </div>
            )
          })}
        </div>
        <div className={`${estilos.linha} ${estilos.linhaDiaInteiro}`}>
          <div className={estilos.rotuloDiaInteiro}>Dia inteiro</div>
          {colunas.map(({ dia, semHorario }) => (
            // Clique no espaço livre cria um evento de dia inteiro. Pelo teclado,
            // o mesmo é feito marcando "Dia inteiro" no formulário.
            <div
              key={paraLocalDate(dia)}
              className={estilos.celulaDiaInteiro}
              data-clicavel={podeCriar}
              onClick={podeCriar ? (e) => e.target === e.currentTarget && aoCriar(dia, null) : undefined}
            >
              {semHorario.map((item) => (
                <BlocoEvento key={item.evento.id} item={item} aoAbrir={aoAbrir} />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className={`${estilos.linha} ${estilos.corpo}`}>
        <div className={estilos.horas} aria-hidden="true">
          {Array.from({ length: 24 }, (_, hora) => (
            <div key={hora} className={estilos.hora}>
              {hora > 0 && <span>{paraLocalTime(hora * 60)}</span>}
            </div>
          ))}
        </div>
        {colunas.map(({ dia, comHorario, posicoes }, indiceDia) => (
          <div key={paraLocalDate(dia)} role="group" aria-label={formatarDataLonga(dia)} className={estilos.coluna}>
            {Array.from({ length: CELULAS }, (_, celula) => {
              if (!podeCriar) return <div key={celula} className={estilos.celula} />
              const pontoDeTabulacao = indiceDia === diaFocado && celula === foco.celula
              return (
                <button
                  key={celula}
                  type="button"
                  className={estilos.celula}
                  data-celula={`${indiceDia}-${celula}`}
                  tabIndex={pontoDeTabulacao ? 0 : -1}
                  aria-label={`Criar evento às ${paraLocalTime(celula * MINUTOS_POR_CELULA)}`}
                  aria-describedby={pontoDeTabulacao ? 'instrucoes-grade' : undefined}
                  onClick={() => aoCriar(dia, celula * MINUTOS_POR_CELULA)}
                  onFocus={() => setFoco({ dia: indiceDia, celula })}
                  onKeyDown={(evento) => teclar(evento, indiceDia, celula)}
                />
              )
            })}
            {comHorario.map(({ item, inicio, fim }) => (
              <BlocoEvento
                key={item.evento.id}
                item={item}
                aoAbrir={aoAbrir}
                posicao={posicionar(inicio, fim, posicoes.get(item.evento.id))}
              />
            ))}
            {mesmoDia(dia, agora) && (
              <div
                className={estilos.agora}
                style={{ top: (minutosDoDia(agora) / 60) * ALTURA_HORA }}
                aria-hidden="true"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function posicionar(inicio: number, fim: number, posicao: Posicao = { coluna: 0, colunas: 1 }): CSSProperties {
  const duracao = Math.max(fim - inicio, DURACAO_MINIMA_DESENHADA)
  return {
    top: (inicio / 60) * ALTURA_HORA,
    height: (duracao / 60) * ALTURA_HORA,
    left: `calc((100% - ${MARGEM_DIREITA}) * ${posicao.coluna} / ${posicao.colunas})`,
    width: `calc((100% - ${MARGEM_DIREITA}) / ${posicao.colunas})`,
  }
}
