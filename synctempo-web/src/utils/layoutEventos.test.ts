import { describe, expect, it } from 'vitest'
import { posicionarEventos } from './layoutEventos'

describe('posicionarEventos', () => {
  it('dá a largura inteira a um evento sozinho', () => {
    const posicoes = posicionarEventos([{ id: 1, inicio: 600, fim: 660 }])
    expect(posicoes.get(1)).toEqual({ coluna: 0, colunas: 1 })
  })

  it('não considera sobrepostos eventos que só se encostam', () => {
    const posicoes = posicionarEventos([
      { id: 1, inicio: 600, fim: 660 },
      { id: 2, inicio: 660, fim: 720 },
    ])
    expect(posicoes.get(1)).toEqual({ coluna: 0, colunas: 1 })
    expect(posicoes.get(2)).toEqual({ coluna: 0, colunas: 1 })
  })

  it('divide em colunas os eventos sobrepostos', () => {
    const posicoes = posicionarEventos([
      { id: 1, inicio: 600, fim: 720 },
      { id: 2, inicio: 630, fim: 690 },
    ])
    expect(posicoes.get(1)).toEqual({ coluna: 0, colunas: 2 })
    expect(posicoes.get(2)).toEqual({ coluna: 1, colunas: 2 })
  })

  it('reaproveita uma coluna livre dentro do mesmo grupo', () => {
    // 1: 10h–13h; 2: 10h30–11h; 3: 11h30–12h cabe na coluna do 2.
    const posicoes = posicionarEventos([
      { id: 1, inicio: 600, fim: 780 },
      { id: 2, inicio: 630, fim: 660 },
      { id: 3, inicio: 690, fim: 720 },
    ])
    expect(posicoes.get(1)).toEqual({ coluna: 0, colunas: 2 })
    expect(posicoes.get(2)).toEqual({ coluna: 1, colunas: 2 })
    expect(posicoes.get(3)).toEqual({ coluna: 1, colunas: 2 })
  })

  it('mantém grupos separados independentes', () => {
    const posicoes = posicionarEventos([
      { id: 1, inicio: 600, fim: 660 },
      { id: 2, inicio: 610, fim: 650 },
      { id: 3, inicio: 900, fim: 960 },
    ])
    expect(posicoes.get(3)).toEqual({ coluna: 0, colunas: 1 })
    expect(posicoes.get(1)?.colunas).toBe(2)
  })
})
