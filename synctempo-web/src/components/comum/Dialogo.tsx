import { useId, useLayoutEffect, useRef, type ReactNode } from 'react'
import { BotaoIcone } from './Botao'
import estilos from './Dialogo.module.css'

interface Props {
  titulo: string
  aoFechar: () => void
  children: ReactNode
  largura?: 'estreita' | 'larga'
}

/**
 * Modal sobre <dialog> nativo: foco preso, Esc e fundo inerte vêm do navegador.
 * Renderize só enquanto estiver aberto; ao desmontar o foco volta para quem abriu.
 * Um elemento com `data-autofocus` recebe o foco inicial.
 */
export function Dialogo({ titulo, aoFechar, children, largura = 'estreita' }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  const montado = useRef(false)
  const idTitulo = useId()

  useLayoutEffect(() => {
    const dialogo = ref.current
    if (!dialogo) return
    const anterior = document.activeElement instanceof HTMLElement ? document.activeElement : null
    montado.current = true
    dialogo.showModal()
    dialogo.querySelector<HTMLElement>('[data-autofocus]')?.focus()
    return () => {
      montado.current = false
      dialogo.close()
      if (anterior?.isConnected) anterior.focus()
    }
  }, [])

  return (
    <dialog
      ref={ref}
      aria-labelledby={idTitulo}
      className={`${estilos.dialogo} ${estilos[largura]}`}
      onCancel={(evento) => {
        evento.preventDefault()
        aoFechar()
      }}
      // O navegador pode fechar o diálogo sem "cancel" (ex.: Esc repetido no Chrome).
      // O evento "close" chega depois; se o diálogo já reabriu (StrictMode), é ignorado.
      onClose={() => {
        if (montado.current && !ref.current?.open) aoFechar()
      }}
    >
      <header className={estilos.cabecalho}>
        <h2 id={idTitulo} className={estilos.titulo}>
          {titulo}
        </h2>
        <BotaoIcone rotulo="Fechar" onClick={aoFechar}>
          ×
        </BotaoIcone>
      </header>
      <div className={estilos.corpo}>{children}</div>
    </dialog>
  )
}
