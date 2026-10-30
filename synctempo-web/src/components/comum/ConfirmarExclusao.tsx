import type { DescricaoErro } from '../../utils/erros'
import { Botao } from './Botao'
import { Dialogo } from './Dialogo'
import { MensagemErro } from './Estados'
import estilos from './ConfirmarExclusao.module.css'

interface Props {
  titulo: string
  mensagem: string
  rotuloConfirmar?: string
  pendente: boolean
  erro: DescricaoErro | null
  aoConfirmar: () => void
  aoManter: () => void
}

/** Confirmação de ação destrutiva. O foco começa em "Manter". */
export function ConfirmarExclusao({
  titulo,
  mensagem,
  rotuloConfirmar = 'Excluir',
  pendente,
  erro,
  aoConfirmar,
  aoManter,
}: Props) {
  return (
    <Dialogo titulo={titulo} aoFechar={aoManter}>
      <div className={estilos.conteudo}>
        <p>{mensagem}</p>
        {erro && <MensagemErro erro={erro} />}
        <div className={estilos.acoes}>
          <Botao variante="primario" onClick={aoConfirmar} disabled={pendente} aria-busy={pendente}>
            {rotuloConfirmar}
          </Botao>
          <Botao onClick={aoManter} data-autofocus>
            Manter
          </Botao>
        </div>
      </div>
    </Dialogo>
  )
}
