import type { ButtonHTMLAttributes } from 'react'
import { Link, type LinkProps } from 'react-router'
import estilos from './Botao.module.css'

type Variante = 'primario' | 'secundario' | 'texto'

function classes(variante: Variante, extra?: string): string {
  return [estilos.botao, estilos[variante], extra].filter(Boolean).join(' ')
}

interface BotaoProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante
}

export function Botao({ variante = 'secundario', type = 'button', className, ...props }: BotaoProps) {
  return <button type={type} className={classes(variante, className)} {...props} />
}

interface BotaoLinkProps extends LinkProps {
  variante?: Variante
}

export function BotaoLink({ variante = 'secundario', className, ...props }: BotaoLinkProps) {
  return <Link className={classes(variante, className)} {...props} />
}

interface BotaoIconeProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> {
  /** Nome acessível; o ícone sozinho não descreve a ação. */
  rotulo: string
}

/** Só para ícones que substituem texto de forma óbvia: ‹ › ×. */
export function BotaoIcone({ rotulo, className, children, ...props }: BotaoIconeProps) {
  return (
    <button type="button" aria-label={rotulo} title={rotulo} className={[estilos.icone, className].filter(Boolean).join(' ')} {...props}>
      <span aria-hidden="true">{children}</span>
    </button>
  )
}
