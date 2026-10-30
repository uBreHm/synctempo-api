import type { LocalDate, LocalTime } from '../types/comum'

// Datas e horários de evento vêm da API sem fuso (LocalDate/LocalTime) e são
// tratados como "flutuantes": exibidos exatamente como vieram, no calendário local.

export const MINUTOS_NO_DIA = 24 * 60

function doisDigitos(numero: number): string {
  return String(numero).padStart(2, '0')
}

/** Date → "YYYY-MM-DD" usando os campos locais. */
export function paraLocalDate(data: Date): LocalDate {
  return `${data.getFullYear()}-${doisDigitos(data.getMonth() + 1)}-${doisDigitos(data.getDate())}`
}

/**
 * "YYYY-MM-DD" → Date à meia-noite local.
 * `new Date("YYYY-MM-DD")` interpretaria o valor em UTC e mudaria o dia a oeste de Greenwich.
 */
export function deLocalDate(valor: LocalDate): Date {
  return new Date(Number(valor.slice(0, 4)), Number(valor.slice(5, 7)) - 1, Number(valor.slice(8, 10)))
}

/** Lê uma data vinda de fora (ex.: URL). Devolve null se não for um "YYYY-MM-DD" real. */
export function lerLocalDate(valor: string | null): Date | null {
  if (!valor || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return null
  const data = deLocalDate(valor)
  return paraLocalDate(data) === valor ? data : null
}

export function hoje(): Date {
  const agora = new Date()
  return new Date(agora.getFullYear(), agora.getMonth(), agora.getDate())
}

export function adicionarDias(data: Date, dias: number): Date {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate() + dias)
}

/** Primeiro dia do mês deslocado em `meses`. */
export function adicionarMeses(data: Date, meses: number): Date {
  return new Date(data.getFullYear(), data.getMonth() + meses, 1)
}

/** Domingo da semana que contém `data`. */
export function inicioDaSemana(data: Date): Date {
  return adicionarDias(data, -data.getDay())
}

export function diasDaSemana(data: Date): Date[] {
  const inicio = inicioDaSemana(data)
  return Array.from({ length: 7 }, (_, indice) => adicionarDias(inicio, indice))
}

/** Seis semanas a partir do domingo anterior ao dia 1 do mês (mini-calendário). */
export function diasDoMes(ano: number, mes: number): Date[] {
  const inicio = inicioDaSemana(new Date(ano, mes, 1))
  return Array.from({ length: 42 }, (_, indice) => adicionarDias(inicio, indice))
}

export function mesmoDia(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

/** "HH:mm" ou "HH:mm:ss" → minutos desde 00:00. */
export function minutosDe(hora: LocalTime): number {
  return Number(hora.slice(0, 2)) * 60 + Number(hora.slice(3, 5))
}

/** Minutos desde 00:00 → "HH:mm". */
export function paraLocalTime(minutos: number): LocalTime {
  return `${doisDigitos(Math.floor(minutos / 60))}:${doisDigitos(minutos % 60)}`
}

export function minutosDoDia(data: Date): number {
  return data.getHours() * 60 + data.getMinutes()
}

const formatoMes = new Intl.DateTimeFormat('pt-BR', { month: 'long' })
const formatoDiaSemanaCurto = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' })
const formatoDataLonga = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
const formatoDataCompleta = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})
const formatoDataCurta = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

function comInicialMaiuscula(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

/** "Outubro de 2026", "Outubro – novembro de 2026" ou "Dezembro de 2026 – janeiro de 2027". */
export function formatarPeriodo(inicio: Date, fim: Date): string {
  const mesInicio = formatoMes.format(inicio)
  const mesFim = formatoMes.format(fim)
  if (inicio.getFullYear() !== fim.getFullYear()) {
    return comInicialMaiuscula(`${mesInicio} de ${inicio.getFullYear()} – ${mesFim} de ${fim.getFullYear()}`)
  }
  if (inicio.getMonth() !== fim.getMonth()) {
    return comInicialMaiuscula(`${mesInicio} – ${mesFim} de ${fim.getFullYear()}`)
  }
  return comInicialMaiuscula(`${mesInicio} de ${inicio.getFullYear()}`)
}

/** "DOM." */
export function formatarDiaSemanaCurto(data: Date): string {
  return formatoDiaSemanaCurto.format(data).toUpperCase()
}

/** "quinta-feira, 29 de outubro" */
export function formatarDataLonga(data: Date): string {
  return formatoDataLonga.format(data)
}

/** "Quinta-feira, 29 de outubro de 2026" */
export function formatarDataCompleta(data: Date): string {
  return comInicialMaiuscula(formatoDataCompleta.format(data))
}

/** "23/10/2026" */
export function formatarDataCurta(data: Date): string {
  return formatoDataCurta.format(data)
}

/** "19:00:00" → "19:00" */
export function formatarHora(hora: LocalTime): string {
  return hora.slice(0, 5)
}
