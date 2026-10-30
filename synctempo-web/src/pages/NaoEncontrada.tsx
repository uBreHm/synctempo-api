import { Link } from 'react-router'
import estilos from './Autenticacao.module.css'

export function NaoEncontrada() {
  return (
    <main className={estilos.tela}>
      <title>Página não encontrada · SyncTempo</title>
      <p className={estilos.marca}>SyncTempo</p>
      <h1>Página não encontrada</h1>
      <p>Este endereço não existe no SyncTempo. Confira o endereço ou volte para a agenda.</p>
      <p>
        <Link to="/">Ir para a agenda</Link>
      </p>
    </main>
  )
}
