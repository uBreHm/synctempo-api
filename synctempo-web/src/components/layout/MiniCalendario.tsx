import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { useAgora } from '../../hooks/useAgora'
import {
  adicionarDias,
  adicionarMeses,
  diasDoMes,
  formatarDataLonga,
  formatarPeriodo,
  mesmoDia,
  paraLocalDate,
} from '../../utils/datas'
import { BotaoIcone } from '../comum/Botao'
import estilos from './MiniCalendario.module.css'

const DIAS_DA_SEMANA = [
  ['D', 'domingo'],
  ['S', 'segunda-feira'],
  ['T', 'terça-feira'],
  ['Q', 'quarta-feira'],
  ['Q', 'quinta-feira'],
  ['S', 'sexta-feira'],
  ['S', 'sábado'],
] as const

const PASSOS: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }

interface Props {
  /** Data exibida na agenda; o mini-calendário acompanha o mês dela. */
  referencia: Date
  /** Dias visíveis na grade, destacados aqui. */
  diasSelecionados: Date[]
  aoEscolher: (dia: Date) => void
}

export function MiniCalendario({ referencia, diasSelecionados, aoEscolher }: Props) {
  const idTitulo = useId()
  const agora = useAgora()
  const tabelaRef = useRef<HTMLTableElement>(null)
  const focoPendente = useRef(false)
  const [mes, setMes] = useState(() => adicionarMeses(referencia, 0))
  const [focado, setFocado] = useState(referencia)

  // Acompanha a agenda quando ela muda de mês por outro caminho (barra superior).
  const mesReferencia = `${referencia.getFullYear()}-${referencia.getMonth()}`
  const [mesReferenciaAnterior, setMesReferenciaAnterior] = useState(mesReferencia)
  if (mesReferencia !== mesReferenciaAnterior) {
    setMesReferenciaAnterior(mesReferencia)
    setMes(adicionarMeses(referencia, 0))
    setFocado(referencia)
  }

  const dias = diasDoMes(mes.getFullYear(), mes.getMonth())
  const selecionados = new Set(diasSelecionados.map(paraLocalDate))
  const chaveFocada = dias.some((dia) => mesmoDia(dia, focado)) ? paraLocalDate(focado) : paraLocalDate(mes)
  const semanas = Array.from({ length: 6 }, (_, semana) => dias.slice(semana * 7, semana * 7 + 7))

  useEffect(() => {
    if (!focoPendente.current) return
    focoPendente.current = false
    tabelaRef.current?.querySelector<HTMLButtonElement>(`[data-dia="${chaveFocada}"]`)?.focus()
  })

  function teclar(evento: KeyboardEvent<HTMLButtonElement>, dia: Date) {
    const passo = PASSOS[evento.key]
    if (passo === undefined) return
    evento.preventDefault()
    const proximo = adicionarDias(dia, passo)
    if (!dias.some((d) => mesmoDia(d, proximo))) setMes(adicionarMeses(proximo, 0))
    setFocado(proximo)
    focoPendente.current = true
  }

  function escolher(dia: Date) {
    setFocado(dia)
    focoPendente.current = true
    aoEscolher(dia)
  }

  return (
    <section aria-labelledby={idTitulo} className={estilos.mini}>
      <div className={estilos.cabecalho}>
        <h2 id={idTitulo} className={estilos.titulo}>
          {formatarPeriodo(mes, mes)}
        </h2>
        <BotaoIcone rotulo="Mês anterior" onClick={() => setMes(adicionarMeses(mes, -1))}>
          ‹
        </BotaoIcone>
        <BotaoIcone rotulo="Próximo mês" onClick={() => setMes(adicionarMeses(mes, 1))}>
          ›
        </BotaoIcone>
      </div>
      <table ref={tabelaRef} className={estilos.tabela}>
        <thead>
          <tr>
            {DIAS_DA_SEMANA.map(([letra, nome]) => (
              <th key={nome} scope="col">
                <span aria-hidden="true">{letra}</span>
                <span className="sr-only">{nome}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {semanas.map((semana) => (
            <tr key={paraLocalDate(semana[0]!)}>
              {semana.map((dia) => {
                const chave = paraLocalDate(dia)
                return (
                  <td key={chave}>
                    <button
                      type="button"
                      className={estilos.dia}
                      data-dia={chave}
                      data-fora={dia.getMonth() !== mes.getMonth()}
                      data-selecionado={selecionados.has(chave)}
                      data-hoje={mesmoDia(dia, agora)}
                      aria-current={mesmoDia(dia, agora) ? 'date' : undefined}
                      aria-label={formatarDataLonga(dia)}
                      tabIndex={chave === chaveFocada ? 0 : -1}
                      onClick={() => escolher(dia)}
                      onKeyDown={(evento) => teclar(evento, dia)}
                    >
                      {dia.getDate()}
                    </button>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
