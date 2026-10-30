import { useId, useState } from 'react'
import { useNavigate } from 'react-router'
import { useAtualizarCalendario, useExcluirCalendario } from '../../hooks/useCalendarios'
import type { CalendarioResponse } from '../../types/calendario'
import type { PapelCalendario } from '../../types/enums'
import { descreverErro } from '../../utils/erros'
import { podeAdministrar } from '../../utils/rotulos'
import { Botao } from '../comum/Botao'
import { ConfirmarExclusao } from '../comum/ConfirmarExclusao'
import pagina from '../../pages/Pagina.module.css'
import { FormularioCalendario } from './FormularioCalendario'

interface Props {
  calendario: CalendarioResponse
  papel: PapelCalendario | undefined
}

export function SecaoDetalhes({ calendario, papel }: Props) {
  const idTitulo = useId()
  const idExcluir = useId()
  const navigate = useNavigate()
  const atualizar = useAtualizarCalendario(calendario.id)
  const excluir = useExcluirCalendario(calendario.id)
  const [confirmando, setConfirmando] = useState(false)
  const admin = podeAdministrar(papel)

  return (
    <>
      <section aria-labelledby={idTitulo} className={pagina.secao}>
        <h2 id={idTitulo}>Detalhes</h2>
        {admin ? (
          <>
            <FormularioCalendario
              inicial={calendario}
              rotuloEnviar="Salvar calendário"
              pendente={atualizar.isPending}
              erro={atualizar.isError ? descreverErro('Não foi possível salvar o calendário.', atualizar.error) : null}
              aoEnviar={(request) => atualizar.mutate(request)}
            />
            <p role="status" className={pagina.status}>
              {atualizar.isSuccess ? 'Calendário salvo.' : ''}
            </p>
          </>
        ) : (
          <>
            <dl className={pagina.dados}>
              <dt>Nome</dt>
              <dd>{calendario.nome}</dd>
              <dt>Descrição</dt>
              <dd>{calendario.descricao ?? 'Sem descrição.'}</dd>
              <dt>Cor</dt>
              <dd>
                <span className={pagina.amostraCor} style={{ background: calendario.cor }} /> {calendario.cor}
              </dd>
            </dl>
            <p className={pagina.secundario}>Só administradores do calendário podem alterar estes dados.</p>
          </>
        )}
      </section>

      {admin && (
        <section aria-labelledby={idExcluir} className={pagina.secao}>
          <h2 id={idExcluir}>Excluir calendário</h2>
          <p>Os eventos, as categorias e os membros deste calendário também serão excluídos.</p>
          <div className={pagina.acoes}>
            <Botao onClick={() => setConfirmando(true)}>Excluir calendário</Botao>
          </div>
          {confirmando && (
            <ConfirmarExclusao
              titulo="Excluir calendário"
              mensagem={`Excluir o calendário '${calendario.nome}'? Os eventos, categorias e membros dele também serão excluídos. Isso não pode ser desfeito.`}
              pendente={excluir.isPending}
              erro={excluir.isError ? descreverErro('Não foi possível excluir o calendário.', excluir.error) : null}
              aoConfirmar={() => excluir.mutate(undefined, { onSuccess: () => navigate('/', { replace: true }) })}
              aoManter={() => {
                excluir.reset()
                setConfirmando(false)
              }}
            />
          )}
        </section>
      )}
    </>
  )
}
