import type { ReactNode } from 'react'
import estilos from './Campo.module.css'

export interface AtributosCampo {
  id: string
  'aria-invalid': true | undefined
  'aria-describedby': string | undefined
}

interface Props {
  id: string
  rotulo: string
  erro?: string
  dica?: string
  opcional?: boolean
  children: (atributos: AtributosCampo) => ReactNode
}

/** Rótulo, controle, dica e erro ligados por id para leitores de tela. */
export function Campo({ id, rotulo, erro, dica, opcional = false, children }: Props) {
  const idDica = dica ? `${id}-dica` : undefined
  const idErro = erro ? `${id}-erro` : undefined
  const descricao = [idDica, idErro].filter(Boolean).join(' ') || undefined

  return (
    <div className={estilos.campo}>
      <label htmlFor={id} className={estilos.rotulo}>
        {rotulo}
        {opcional && <span className={estilos.opcional}> (opcional)</span>}
      </label>
      {children({ id, 'aria-invalid': erro ? true : undefined, 'aria-describedby': descricao })}
      {dica && (
        <p id={idDica} className={estilos.dica}>
          {dica}
        </p>
      )}
      {erro && (
        <p id={idErro} className={estilos.erro}>
          {erro}
        </p>
      )}
    </div>
  )
}
