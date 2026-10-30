export interface Intervalo {
  id: number
  /** Minutos desde 00:00. */
  inicio: number
  /** Minutos desde 00:00, maior que `inicio`. */
  fim: number
}

export interface Posicao {
  /** Coluna do evento dentro do grupo, a partir de 0. */
  coluna: number
  /** Total de colunas do grupo de sobreposição. */
  colunas: number
}

/**
 * Distribui eventos sobrepostos em colunas lado a lado, como numa agenda.
 * Eventos encadeados por sobreposição formam um grupo que divide a largura do dia.
 * Um evento que começa quando outro termina não é considerado sobreposto.
 */
export function posicionarEventos(intervalos: Intervalo[]): Map<number, Posicao> {
  const ordenados = [...intervalos].sort((a, b) => a.inicio - b.inicio || b.fim - a.fim)
  const posicoes = new Map<number, Posicao>()

  let grupo: { id: number; coluna: number }[] = []
  let fimPorColuna: number[] = []
  let fimDoGrupo = Number.NEGATIVE_INFINITY

  const fecharGrupo = () => {
    for (const { id, coluna } of grupo) posicoes.set(id, { coluna, colunas: fimPorColuna.length })
    grupo = []
    fimPorColuna = []
  }

  for (const intervalo of ordenados) {
    if (intervalo.inicio >= fimDoGrupo) {
      fecharGrupo()
      fimDoGrupo = intervalo.fim
    } else {
      fimDoGrupo = Math.max(fimDoGrupo, intervalo.fim)
    }

    let coluna = fimPorColuna.findIndex((fim) => fim <= intervalo.inicio)
    if (coluna === -1) {
      coluna = fimPorColuna.length
      fimPorColuna.push(intervalo.fim)
    } else {
      fimPorColuna[coluna] = intervalo.fim
    }
    grupo.push({ id: intervalo.id, coluna })
  }
  fecharGrupo()

  return posicoes
}
