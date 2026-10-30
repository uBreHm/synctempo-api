import { Botao, BotaoIcone } from '../comum/Botao'
import estilos from './NavegacaoAgenda.module.css'

export type Visao = 'semana' | 'dia'

interface Props {
  visao: Visao
  titulo: string
  aoIrParaHoje: () => void
  aoVoltar: () => void
  aoAvancar: () => void
  aoMudarVisao: (visao: Visao) => void
}

export function NavegacaoAgenda({ visao, titulo, aoIrParaHoje, aoVoltar, aoAvancar, aoMudarVisao }: Props) {
  return (
    <>
      <Botao onClick={aoIrParaHoje}>Hoje</Botao>
      <BotaoIcone rotulo={visao === 'semana' ? 'Semana anterior' : 'Dia anterior'} onClick={aoVoltar}>
        ‹
      </BotaoIcone>
      <BotaoIcone rotulo={visao === 'semana' ? 'Próxima semana' : 'Próximo dia'} onClick={aoAvancar}>
        ›
      </BotaoIcone>
      <h1 className={estilos.titulo} aria-live="polite">
        {titulo}
      </h1>
      <div role="group" aria-label="Visão" className={estilos.visoes}>
        <button type="button" aria-pressed={visao === 'dia'} onClick={() => aoMudarVisao('dia')}>
          Dia
        </button>
        <button type="button" aria-pressed={visao === 'semana'} onClick={() => aoMudarVisao('semana')}>
          Semana
        </button>
      </div>
    </>
  )
}
