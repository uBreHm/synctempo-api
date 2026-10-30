import type { ReactNode } from 'react'
import type { DescricaoErro } from '../../utils/erros'
import { Botao } from './Botao'
import estilos from './Estados.module.css'

export function Carregando({ texto }: { texto: string }) {
  return (
    <p role="status" className={estilos.estado}>
      {texto}
    </p>
  )
}

export function Vazio({ texto, children }: { texto: string; children?: ReactNode }) {
  return (
    <div className={estilos.estado}>
      <p>{texto}</p>
      {children}
    </div>
  )
}

export function MensagemErro({ erro, children }: { erro: DescricaoErro; children?: ReactNode }) {
  return (
    <div role="alert" className={estilos.erro}>
      <p className={estilos.resumo}>{erro.resumo}</p>
      {erro.detalhe && <p>Motivo: {erro.detalhe}</p>}
      <p>{erro.orientacao}</p>
      {children}
    </div>
  )
}

export function ErroCarregamento({ erro, aoTentarNovamente }: { erro: DescricaoErro; aoTentarNovamente: () => void }) {
  return (
    <MensagemErro erro={erro}>
      <div>
        <Botao onClick={aoTentarNovamente}>Tentar novamente</Botao>
      </div>
    </MensagemErro>
  )
}
