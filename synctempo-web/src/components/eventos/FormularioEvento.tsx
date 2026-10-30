import { useId, useState, type CSSProperties, type FormEvent } from 'react'
import { useCategorias } from '../../hooks/useCategorias'
import { useSalvarEvento } from '../../hooks/useEventos'
import type { LocalDate } from '../../types/comum'
import type { Visibilidade } from '../../types/enums'
import type { EventoRequest, EventoResponse } from '../../types/evento'
import type { ParticipacaoResponse } from '../../types/membro'
import { formatarHora, hoje, MINUTOS_NO_DIA, paraLocalDate, paraLocalTime } from '../../utils/datas'
import { descreverErro } from '../../utils/erros'
import { ROTULO_VISIBILIDADE } from '../../utils/rotulos'
import { exigirTexto, limitar, REGEX_LINK, textoOuNulo, type Erros } from '../../utils/validacao'
import { Botao } from '../comum/Botao'
import { Campo } from '../comum/Campo'
import { Dialogo } from '../comum/Dialogo'
import { Carregando, ErroCarregamento, MensagemErro } from '../comum/Estados'
import estilos from './FormularioEvento.module.css'

export interface ValoresIniciaisEvento {
  calendarioId: number | undefined
  dataEvento: LocalDate
  /** Minutos desde 00:00; null para dia inteiro. */
  inicio: number | null
}

interface Props {
  /** Calendários em que a conta pode criar eventos; na edição, só o calendário do evento. */
  calendarios: ParticipacaoResponse[]
  /** Presente na edição. */
  evento?: EventoResponse
  inicial?: ValoresIniciaisEvento
  aoFechar: () => void
  aoSalvo: (evento: EventoResponse) => void
}

interface Campos {
  calendarioId: string
  titulo: string
  dataEvento: string
  diaInteiro: boolean
  horaInicio: string
  horaFim: string
  localizacao: string
  linkReuniao: string
  descricao: string
  visibilidade: Visibilidade
  categoriaIds: number[]
}

type CampoValidado =
  | 'calendarioId'
  | 'titulo'
  | 'dataEvento'
  | 'horaInicio'
  | 'horaFim'
  | 'localizacao'
  | 'linkReuniao'
  | 'descricao'

/** Ordem dos campos na tela, para focar o primeiro com erro. */
const ORDEM: CampoValidado[] = [
  'titulo',
  'calendarioId',
  'dataEvento',
  'horaInicio',
  'horaFim',
  'localizacao',
  'linkReuniao',
  'descricao',
]

const VISIBILIDADES: Visibilidade[] = ['DETALHADA', 'SOMENTE_OCUPADO']

function camposIniciais(evento?: EventoResponse, inicial?: ValoresIniciaisEvento): Campos {
  if (evento) {
    return {
      calendarioId: String(evento.calendarioId),
      titulo: evento.titulo,
      dataEvento: evento.dataEvento,
      diaInteiro: evento.diaInteiro,
      horaInicio: evento.horaInicio ? formatarHora(evento.horaInicio) : '09:00',
      horaFim: evento.horaFim ? formatarHora(evento.horaFim) : '10:00',
      localizacao: evento.localizacao ?? '',
      linkReuniao: evento.linkReuniao ?? '',
      descricao: evento.descricao ?? '',
      visibilidade: evento.visibilidade,
      categoriaIds: evento.categorias.map((categoria) => categoria.id),
    }
  }
  const inicio = inicial?.inicio ?? null
  const inicioOuNove = inicio ?? 9 * 60
  return {
    calendarioId: inicial?.calendarioId === undefined ? '' : String(inicial.calendarioId),
    titulo: '',
    dataEvento: inicial?.dataEvento ?? paraLocalDate(hoje()),
    diaInteiro: inicio === null,
    horaInicio: paraLocalTime(inicioOuNove),
    horaFim: paraLocalTime(Math.min(inicioOuNove + 60, MINUTOS_NO_DIA - 1)),
    localizacao: '',
    linkReuniao: '',
    descricao: '',
    visibilidade: 'DETALHADA',
    categoriaIds: [],
  }
}

/** Espelha EventoRequest e a regra de horário de EventoService.validarHorario. */
function validar(campos: Campos): Erros<CampoValidado> {
  const link = campos.linkReuniao.trim()
  const erros: Erros<CampoValidado> = {
    calendarioId: campos.calendarioId === '' ? 'Escolha um calendário.' : undefined,
    titulo: exigirTexto(campos.titulo, 'Informe o título.', 160),
    dataEvento: campos.dataEvento === '' ? 'Informe a data.' : undefined,
    localizacao: limitar(campos.localizacao.trim(), 255),
    linkReuniao:
      link === ''
        ? undefined
        : (limitar(link, 2048) ??
          (REGEX_LINK.test(link) ? undefined : 'Informe o link completo, começando com http:// ou https://.')),
    descricao: limitar(campos.descricao.trim(), 4000),
  }
  if (!campos.diaInteiro) {
    erros.horaInicio = campos.horaInicio === '' ? 'Informe o horário de início.' : undefined
    erros.horaFim =
      campos.horaFim === ''
        ? 'Informe o horário de fim.'
        : campos.horaInicio !== '' && campos.horaFim <= campos.horaInicio
          ? 'O fim precisa ser depois do início, no mesmo dia.'
          : undefined
  }
  return erros
}

function paraRequest(campos: Campos): EventoRequest {
  return {
    titulo: campos.titulo.trim(),
    descricao: textoOuNulo(campos.descricao),
    localizacao: textoOuNulo(campos.localizacao),
    linkReuniao: textoOuNulo(campos.linkReuniao),
    dataEvento: campos.dataEvento,
    horaInicio: campos.diaInteiro ? null : campos.horaInicio,
    horaFim: campos.diaInteiro ? null : campos.horaFim,
    diaInteiro: campos.diaInteiro,
    visibilidade: campos.visibilidade,
    categoriaIds: campos.categoriaIds,
  }
}

export function FormularioEvento({ calendarios, evento, inicial, aoFechar, aoSalvo }: Props) {
  const id = useId()
  const [campos, setCampos] = useState(() => camposIniciais(evento, inicial))
  const [erros, setErros] = useState<Erros<CampoValidado>>({})
  const salvar = useSalvarEvento()
  const calendarioId = campos.calendarioId === '' ? undefined : Number(campos.calendarioId)
  const categorias = useCategorias(calendarioId)
  const editando = evento !== undefined
  const idCampo = (campo: CampoValidado) => `${id}-${campo}`

  function alterar<C extends keyof Campos>(campo: C, valor: Campos[C]) {
    setCampos((atuais) => ({ ...atuais, [campo]: valor }))
  }

  function alternarCategoria(categoriaId: number) {
    setCampos((atuais) => ({
      ...atuais,
      categoriaIds: atuais.categoriaIds.includes(categoriaId)
        ? atuais.categoriaIds.filter((idAtual) => idAtual !== categoriaId)
        : [...atuais.categoriaIds, categoriaId],
    }))
  }

  function enviar(e: FormEvent) {
    e.preventDefault()
    const novosErros = validar(campos)
    setErros(novosErros)
    const primeiro = ORDEM.find((campo) => novosErros[campo])
    if (primeiro) {
      document.getElementById(idCampo(primeiro))?.focus()
      return
    }
    salvar.mutate(
      { calendarioId: Number(campos.calendarioId), id: evento?.id, request: paraRequest(campos) },
      { onSuccess: aoSalvo },
    )
  }

  return (
    <Dialogo titulo={editando ? 'Editar evento' : 'Novo evento'} aoFechar={aoFechar} largura="larga">
      <form className={estilos.formulario} onSubmit={enviar} noValidate>
        <Campo id={idCampo('titulo')} rotulo="Título" erro={erros.titulo}>
          {(atributos) => (
            <input
              {...atributos}
              type="text"
              maxLength={160}
              value={campos.titulo}
              onChange={(e) => alterar('titulo', e.target.value)}
              data-autofocus
            />
          )}
        </Campo>

        {editando ? (
          <p>
            <span className={estilos.rotulo}>Calendário: </span>
            {calendarios[0]?.nome}
          </p>
        ) : (
          <Campo id={idCampo('calendarioId')} rotulo="Calendário" erro={erros.calendarioId}>
            {(atributos) => (
              <select
                {...atributos}
                value={campos.calendarioId}
                onChange={(e) => setCampos((atuais) => ({ ...atuais, calendarioId: e.target.value, categoriaIds: [] }))}
              >
                {campos.calendarioId === '' && <option value="">Escolha um calendário</option>}
                {calendarios.map((calendario) => (
                  <option key={calendario.calendarioId} value={calendario.calendarioId}>
                    {calendario.nome}
                  </option>
                ))}
              </select>
            )}
          </Campo>
        )}

        <div className={estilos.linha}>
          <Campo id={idCampo('dataEvento')} rotulo="Data" erro={erros.dataEvento}>
            {(atributos) => (
              <input
                {...atributos}
                type="date"
                value={campos.dataEvento}
                onChange={(e) => alterar('dataEvento', e.target.value)}
              />
            )}
          </Campo>
          <label className={estilos.marcador}>
            <input
              type="checkbox"
              checked={campos.diaInteiro}
              onChange={(e) => alterar('diaInteiro', e.target.checked)}
            />
            Dia inteiro
          </label>
        </div>

        {!campos.diaInteiro && (
          <div className={estilos.linha}>
            <Campo id={idCampo('horaInicio')} rotulo="Início" erro={erros.horaInicio}>
              {(atributos) => (
                <input
                  {...atributos}
                  type="time"
                  value={campos.horaInicio}
                  onChange={(e) => alterar('horaInicio', e.target.value)}
                />
              )}
            </Campo>
            <Campo id={idCampo('horaFim')} rotulo="Fim" erro={erros.horaFim}>
              {(atributos) => (
                <input
                  {...atributos}
                  type="time"
                  value={campos.horaFim}
                  onChange={(e) => alterar('horaFim', e.target.value)}
                />
              )}
            </Campo>
          </div>
        )}

        <Campo id={idCampo('localizacao')} rotulo="Local" opcional erro={erros.localizacao}>
          {(atributos) => (
            <input
              {...atributos}
              type="text"
              maxLength={255}
              value={campos.localizacao}
              onChange={(e) => alterar('localizacao', e.target.value)}
            />
          )}
        </Campo>

        <Campo
          id={idCampo('linkReuniao')}
          rotulo="Link da reunião"
          opcional
          dica="Endereço completo, começando com http:// ou https://."
          erro={erros.linkReuniao}
        >
          {(atributos) => (
            <input
              {...atributos}
              type="url"
              maxLength={2048}
              value={campos.linkReuniao}
              onChange={(e) => alterar('linkReuniao', e.target.value)}
            />
          )}
        </Campo>

        <Campo id={idCampo('descricao')} rotulo="Descrição" opcional erro={erros.descricao}>
          {(atributos) => (
            <textarea
              {...atributos}
              rows={3}
              maxLength={4000}
              value={campos.descricao}
              onChange={(e) => alterar('descricao', e.target.value)}
            />
          )}
        </Campo>

        <fieldset className={estilos.grupo}>
          <legend>
            Categorias <span className={estilos.opcional}>(opcional)</span>
          </legend>
          {calendarioId === undefined ? (
            <p className={estilos.secundario}>Escolha um calendário para ver as categorias dele.</p>
          ) : categorias.isPending ? (
            <Carregando texto="Carregando categorias…" />
          ) : categorias.isError ? (
            <ErroCarregamento
              erro={descreverErro('Não foi possível carregar as categorias deste calendário.', categorias.error)}
              aoTentarNovamente={() => categorias.refetch()}
            />
          ) : categorias.data.length === 0 ? (
            <p className={estilos.secundario}>
              Este calendário não tem categorias. Crie categorias na configuração do calendário.
            </p>
          ) : (
            <div className={estilos.opcoes}>
              {categorias.data.map((categoria) => (
                <label key={categoria.id} className={estilos.marcador}>
                  <input
                    type="checkbox"
                    checked={campos.categoriaIds.includes(categoria.id)}
                    onChange={() => alternarCategoria(categoria.id)}
                    style={{ '--cor-marcador': categoria.cor } as CSSProperties}
                  />
                  {categoria.nome}
                </label>
              ))}
            </div>
          )}
        </fieldset>

        <fieldset className={estilos.grupo}>
          <legend>Visibilidade para os outros membros</legend>
          <div className={estilos.opcoes}>
            {VISIBILIDADES.map((visibilidade) => (
              <label key={visibilidade} className={estilos.marcador}>
                <input
                  type="radio"
                  name={`${id}-visibilidade`}
                  checked={campos.visibilidade === visibilidade}
                  onChange={() => alterar('visibilidade', visibilidade)}
                />
                {ROTULO_VISIBILIDADE[visibilidade]}
              </label>
            ))}
          </div>
          <p className={estilos.secundario}>
            Com “{ROTULO_VISIBILIDADE.SOMENTE_OCUPADO}”, os outros membros veem só o horário e o título “Ocupado”.
          </p>
        </fieldset>

        {salvar.isError && (
          <MensagemErro
            erro={descreverErro('Não foi possível salvar o evento.', salvar.error, {
              403: 'Você não pode editar eventos deste calendário. Peça a um administrador o papel de Editor.',
              404: 'O evento pode ter sido excluído por outra pessoa. Feche este formulário para atualizar a agenda.',
            })}
          />
        )}

        <div className={estilos.acoes}>
          <Botao type="submit" variante="primario" disabled={salvar.isPending} aria-busy={salvar.isPending}>
            Salvar evento
          </Botao>
          <Botao onClick={aoFechar}>Cancelar</Botao>
        </div>
      </form>
    </Dialogo>
  )
}
