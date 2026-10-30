import { useState, type CSSProperties } from 'react'
import { useEvento, useExcluirEvento } from '../../hooks/useEventos'
import { deLocalDate, formatarDataCompleta, formatarHora } from '../../utils/datas'
import { descreverErro } from '../../utils/erros'
import { podeEditar, ROTULO_VISIBILIDADE } from '../../utils/rotulos'
import type { EventoNaGrade } from '../agenda/BlocoEvento'
import { Botao } from '../comum/Botao'
import { ConfirmarExclusao } from '../comum/ConfirmarExclusao'
import { Dialogo } from '../comum/Dialogo'
import { ErroCarregamento } from '../comum/Estados'
import estilos from './DetalheEvento.module.css'

interface Props {
  item: EventoNaGrade
  /** Conta autenticada, para saber se os detalhes de um evento SOMENTE_OCUPADO estão ocultos. */
  usuarioId: number | undefined
  aoEditar: (item: EventoNaGrade) => void
  aoFechar: () => void
  aoExcluido: (titulo: string) => void
}

export function DetalheEvento({ item, usuarioId, aoEditar, aoFechar, aoExcluido }: Props) {
  const { calendario } = item
  // Mostra o que já veio na lista e atualiza com GET do evento.
  const consulta = useEvento(calendario.calendarioId, item.evento.id, item.evento)
  const evento = consulta.data ?? item.evento
  const excluir = useExcluirEvento()
  const [confirmando, setConfirmando] = useState(false)

  const editavel = podeEditar(calendario.papel)
  // A API devolve título "Ocupado" e campos nulos para eventos SOMENTE_OCUPADO de outra
  // pessoa. Editar esse retorno gravaria "Ocupado" por cima dos dados reais.
  const detalhesOcultos = evento.visibilidade === 'SOMENTE_OCUPADO' && evento.criadoPorId !== usuarioId
  const horario =
    evento.diaInteiro || !evento.horaInicio || !evento.horaFim
      ? 'dia inteiro'
      : `${formatarHora(evento.horaInicio)} – ${formatarHora(evento.horaFim)}`

  return (
    <Dialogo titulo={evento.titulo} aoFechar={aoFechar}>
      <div className={estilos.conteudo}>
        <dl className={estilos.dados}>
          <dt>Quando</dt>
          <dd>
            {formatarDataCompleta(deLocalDate(evento.dataEvento))}, {horario}
          </dd>
          <dt>Calendário</dt>
          <dd>
            <span className={estilos.amostra} style={{ '--cor-calendario': calendario.cor } as CSSProperties} />{' '}
            {calendario.nome}
          </dd>
          {evento.localizacao && (
            <>
              <dt>Local</dt>
              <dd>{evento.localizacao}</dd>
            </>
          )}
          {evento.linkReuniao && (
            <>
              <dt>Link da reunião</dt>
              <dd>
                <a href={evento.linkReuniao} target="_blank" rel="noopener noreferrer">
                  {evento.linkReuniao}
                </a>
              </dd>
            </>
          )}
          {evento.descricao && (
            <>
              <dt>Descrição</dt>
              <dd className={estilos.descricao}>{evento.descricao}</dd>
            </>
          )}
          {evento.categorias.length > 0 && (
            <>
              <dt>Categorias</dt>
              <dd>{evento.categorias.map((categoria) => categoria.nome).join(', ')}</dd>
            </>
          )}
          <dt>Visibilidade</dt>
          <dd>{ROTULO_VISIBILIDADE[evento.visibilidade]}</dd>
        </dl>

        {detalhesOcultos && (
          <p className={estilos.secundario}>
            Quem criou este evento mostra aos outros membros só que o horário está ocupado.
            {editavel && ' Por isso ele não pode ser editado por aqui.'}
          </p>
        )}

        {consulta.isError && (
          <ErroCarregamento
            erro={descreverErro('Não foi possível atualizar os dados deste evento.', consulta.error, {
              404: 'Ele pode ter sido excluído por outra pessoa. Feche este evento para atualizar a agenda.',
            })}
            aoTentarNovamente={() => consulta.refetch()}
          />
        )}

        {editavel && (
          <div className={estilos.acoes}>
            {!detalhesOcultos && (
              <Botao variante="primario" onClick={() => aoEditar({ calendario, evento })}>
                Editar evento
              </Botao>
            )}
            <Botao onClick={() => setConfirmando(true)}>Excluir evento</Botao>
          </div>
        )}
      </div>

      {confirmando && (
        <ConfirmarExclusao
          titulo="Excluir evento"
          mensagem={`Excluir '${evento.titulo}'? Isso não pode ser desfeito.`}
          pendente={excluir.isPending}
          erro={excluir.isError ? descreverErro('Não foi possível excluir o evento.', excluir.error) : null}
          aoConfirmar={() =>
            excluir.mutate(
              { calendarioId: calendario.calendarioId, id: evento.id },
              { onSuccess: () => aoExcluido(evento.titulo) },
            )
          }
          aoManter={() => {
            excluir.reset()
            setConfirmando(false)
          }}
        />
      )}
    </Dialogo>
  )
}
