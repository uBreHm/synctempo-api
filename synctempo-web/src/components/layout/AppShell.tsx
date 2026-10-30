import { useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import { useSessao } from '../../hooks/useSessao'
import { Botao } from '../comum/Botao'
import estilos from './AppShell.module.css'

interface Props {
  /** Controles centrais da barra superior (navegação da agenda). */
  navegacao?: ReactNode
  /** Coluna lateral; quando ausente o conteúdo ocupa a largura toda. */
  lateral?: ReactNode
  children: ReactNode
}

export function AppShell({ navegacao, lateral, children }: Props) {
  const { usuario, sair } = useSessao()
  const [lateralAberta, setLateralAberta] = useState(false)

  return (
    <div className={estilos.shell}>
      <a href="#conteudo" className={estilos.pular}>
        Pular para o conteúdo
      </a>
      <header className={estilos.barra}>
        {lateral && (
          <Botao
            className={estilos.alternarLateral}
            aria-expanded={lateralAberta}
            aria-controls="lateral"
            onClick={() => setLateralAberta((aberta) => !aberta)}
          >
            {lateralAberta ? 'Ocultar calendários' : 'Mostrar calendários'}
          </Botao>
        )}
        <Link to="/" className={estilos.marca}>
          SyncTempo
        </Link>
        {navegacao && <div className={estilos.navegacao}>{navegacao}</div>}
        <nav aria-label="Conta" className={estilos.conta}>
          {usuario && <span className={estilos.nome}>{usuario.name}</span>}
          <Link to="/conta">Minha conta</Link>
          <Botao variante="texto" onClick={sair}>
            Sair
          </Botao>
        </nav>
      </header>
      <div className={estilos.corpo}>
        {lateral && (
          <aside id="lateral" aria-label="Calendários" className={estilos.lateral} data-aberta={lateralAberta}>
            {lateral}
          </aside>
        )}
        <main id="conteudo" tabIndex={-1} className={estilos.conteudo}>
          {children}
        </main>
      </div>
    </div>
  )
}
