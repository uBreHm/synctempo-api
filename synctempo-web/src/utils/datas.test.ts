import { describe, expect, it } from 'vitest'
import {
  adicionarDias,
  deLocalDate,
  diasDaSemana,
  diasDoMes,
  formatarDiaSemanaCurto,
  formatarPeriodo,
  inicioDaSemana,
  lerLocalDate,
  minutosDe,
  paraLocalDate,
  paraLocalTime,
} from './datas'

describe('LocalDate', () => {
  it('lê "YYYY-MM-DD" no dia local, sem deslocamento de fuso', () => {
    const data = deLocalDate('2026-10-27')
    expect(data.getFullYear()).toBe(2026)
    expect(data.getMonth()).toBe(9)
    expect(data.getDate()).toBe(27)
    expect(data.getHours()).toBe(0)
  })

  it('faz ida e volta', () => {
    expect(paraLocalDate(deLocalDate('2026-01-05'))).toBe('2026-01-05')
  })

  it('rejeita datas inexistentes ou mal formatadas vindas da URL', () => {
    expect(lerLocalDate('2026-02-30')).toBeNull()
    expect(lerLocalDate('29/10/2026')).toBeNull()
    expect(lerLocalDate(null)).toBeNull()
    expect(lerLocalDate('2026-10-29')).not.toBeNull()
  })
})

describe('semana', () => {
  it('começa no domingo', () => {
    const quinta = deLocalDate('2026-10-29')
    expect(paraLocalDate(inicioDaSemana(quinta))).toBe('2026-10-25')
  })

  it('mantém o domingo como início quando a data já é domingo', () => {
    expect(paraLocalDate(inicioDaSemana(deLocalDate('2026-10-25')))).toBe('2026-10-25')
  })

  it('lista sete dias consecutivos, atravessando a virada do mês', () => {
    const dias = diasDaSemana(deLocalDate('2026-10-29')).map(paraLocalDate)
    expect(dias).toEqual([
      '2026-10-25',
      '2026-10-26',
      '2026-10-27',
      '2026-10-28',
      '2026-10-29',
      '2026-10-30',
      '2026-10-31',
    ])
    expect(paraLocalDate(adicionarDias(deLocalDate('2026-10-31'), 1))).toBe('2026-11-01')
  })

  it('monta seis semanas para o mini-calendário', () => {
    const dias = diasDoMes(2026, 9)
    expect(dias).toHaveLength(42)
    expect(paraLocalDate(dias[0]!)).toBe('2026-09-27')
  })
})

describe('LocalTime', () => {
  it('converte "HH:mm:ss" e "HH:mm" em minutos', () => {
    expect(minutosDe('19:00:00')).toBe(1140)
    expect(minutosDe('20:30')).toBe(1230)
    expect(minutosDe('00:00:00')).toBe(0)
  })

  it('converte minutos em "HH:mm"', () => {
    expect(paraLocalTime(0)).toBe('00:00')
    expect(paraLocalTime(1439)).toBe('23:59')
    expect(paraLocalTime(570)).toBe('09:30')
  })
})

describe('formatação', () => {
  it('nomeia o período da semana', () => {
    expect(formatarPeriodo(deLocalDate('2026-10-04'), deLocalDate('2026-10-10'))).toBe('Outubro de 2026')
    expect(formatarPeriodo(deLocalDate('2026-10-25'), deLocalDate('2026-11-01'))).toBe(
      'Outubro – novembro de 2026',
    )
    expect(formatarPeriodo(deLocalDate('2026-12-27'), deLocalDate('2027-01-02'))).toBe(
      'Dezembro de 2026 – janeiro de 2027',
    )
  })

  it('abrevia o dia da semana em maiúsculas', () => {
    expect(formatarDiaSemanaCurto(deLocalDate('2026-10-25'))).toBe('DOM.')
  })
})
