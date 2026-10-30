import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import type { EventoNaGrade } from '../components/agenda/BlocoEvento'
import { Grade } from '../components/agenda/Grade'
import { NavegacaoAgenda, type Visao } from '../components/agenda/NavegacaoAgenda'
import { Botao, BotaoLink } from '../components/comum/Botao'
import { Carregando, ErroCarregamento, Vazio } from '../components/comum/Estados'
import { DetalheEvento } from '../components/eventos/DetalheEvento'
import { FormularioEvento, type ValoresIniciaisEvento } from '../components/eventos/FormularioEvento'
import { AppShell } from '../components/layout/AppShell'
import { ListaCalendarios } from '../components/layout/ListaCalendarios'
import { MiniCalendario } from '../components/layout/MiniCalendario'
import { useCalendariosOcultos } from '../hooks/useCalendariosOcultos'
import { useEventosDosCalendarios } from '../hooks/useEventos'
import { useParticipacoes } from '../hooks/useParticipacoes'
import { useSessao } from '../hooks/useSessao'
import type { EventoResponse } from '../types/evento'
import {
  adicionarDias,
  deLocalDate,
  diasDaSemana,
  formatarDataCompleta,
  formatarPeriodo,
  hoje,
  lerLocalDate,
  mesmoDia,
  MINUTOS_NO_DIA,
  paraLocalDate,
} from '../utils/datas'
import { descreverErro } from '../utils/erros'
import { podeEditar } from '../utils/rotulos'
import estilos from './Agenda.module.css'

type DialogoAgenda =
  | { tipo: 'novo'; inicial: ValoresIniciaisEvento }
  | { tipo: 'detalhe'; item: EventoNaGrade }
  | { tipo: 'editar'; item: EventoNaGrade }
  | null

export function Agenda() {
  const [parametros, setParametros] = useSearchParams()
  const visao: Visao = parametros.get('visao') === 'dia' ? 'dia' : 'semana'
  const chaveReferencia = paraLocalDate(lerLocalDate(parametros.get('data')) ?? hoje())
  const referencia = useMemo(() => deLocalDate(chaveReferencia), [chaveReferencia])
  const dias = useMemo(() => (visao === 'semana' ? diasDaSemana(referencia) : [referencia]), [visao, referencia])
  const primeiroDia = dias[0] ?? referencia
  const ultimoDia = dias[dias.length - 1] ?? referencia

  const { usuario } = useSessao()
  const participacoes = useParticipacoes()
  const { ocultos, alternar } = useCalendariosOcultos()
  const calendarios = participacoes.data ?? []
  const visiveis = calendarios.filter((calendario) => !ocultos.has(calendario.calendarioId))
  const editaveis = calendarios.filter((calendario) => podeEditar(calendario.papel))
  const consultas = useEventosDosCalendarios(visiveis.map((calendario) => calendario.calendarioId))

  const [dialogo, setDialogo] = useState<DialogoAgenda>(null)
  const [aviso, setAviso] = useState('')

  const diasExibidos = new Set(dias.map(paraLocalDate))
  const eventosNaTela: EventoNaGrade[] = visiveis.flatMap((calendario, indice) =>
    (consultas[indice]?.data ?? [])
      .filter((evento) => diasExibidos.has(evento.dataEvento))
      .map((evento) => ({ evento, calendario })),
  )
  const falhas = visiveis.flatMap((calendario, indice) => {
    const consulta = consultas[indice]
    return consulta?.isError ? [{ calendario, consulta }] : []
  })

  function navegar(data: Date, novaVisao: Visao = visao) {
    setParametros({ data: paraLocalDate(data), visao: novaVisao })
  }

  function abrirNovo(dia: Date, inicio: number | null) {
    setAviso('')
    const padrao = visiveis.find((calendario) => podeEditar(calendario.papel)) ?? editaveis[0]
    setDialogo({
      tipo: 'novo',
      inicial: { calendarioId: padrao?.calendarioId, dataEvento: paraLocalDate(dia), inicio },
    })
  }

  function criarPeloBotao() {
    const hojeData = hoje()
    const exibeHoje = dias.some((dia) => mesmoDia(dia, hojeData))
    const proximaHora = Math.min((new Date().getHours() + 1) * 60, MINUTOS_NO_DIA - 60)
    abrirNovo(exibeHoje ? hojeData : primeiroDia, exibeHoje ? proximaHora : 9 * 60)
  }

  function aoSalvo(evento: EventoResponse) {
    setDialogo(null)
    setAviso(`Evento '${evento.titulo}' salvo.`)
    if (!diasExibidos.has(evento.dataEvento)) navegar(deLocalDate(evento.dataEvento))
  }

  function aoExcluido(titulo: string) {
    setDialogo(null)
    setAviso(`Evento '${titulo}' excluído.`)
    // O bloco que abriu o diálogo deixa de existir; o foco vai para o conteúdo.
    requestAnimationFrame(() => document.getElementById('conteudo')?.focus())
  }

  const titulo = visao === 'semana' ? formatarPeriodo(primeiroDia, ultimoDia) : formatarDataCompleta(primeiroDia)
  const periodo = visao === 'semana' ? 'nesta semana' : 'neste dia'

  let situacao = ''
  if (visiveis.length === 0) {
    situacao = 'Todos os calendários estão ocultos. Marque um calendário na lateral para ver os eventos dele.'
  } else if (consultas.some((consulta) => consulta.isPending)) {
    situacao = 'Carregando eventos…'
  } else if (eventosNaTela.length === 0 && falhas.length === 0) {
    situacao =
      editaveis.length > 0 ? `Nenhum evento ${periodo}. Clique em um horário para criar um.` : `Nenhum evento ${periodo}.`
  }

  const lateral = (
    <div className={estilos.lateral}>
      {editaveis.length > 0 && (
        <Botao variante="primario" onClick={criarPeloBotao}>
          Criar evento
        </Botao>
      )}
      <MiniCalendario referencia={referencia} diasSelecionados={dias} aoEscolher={(dia) => navegar(dia)} />
      {calendarios.length > 0 && (
        <ListaCalendarios calendarios={calendarios} ocultos={ocultos} aoAlternar={alternar} />
      )}
      <BotaoLink to="/calendarios/novo" variante="texto" className={estilos.criarCalendario}>
        Criar calendário
      </BotaoLink>
    </div>
  )

  return (
    <AppShell
      lateral={lateral}
      navegacao={
        <NavegacaoAgenda
          visao={visao}
          titulo={titulo}
          aoIrParaHoje={() => navegar(hoje())}
          aoVoltar={() => navegar(adicionarDias(referencia, visao === 'semana' ? -7 : -1))}
          aoAvancar={() => navegar(adicionarDias(referencia, visao === 'semana' ? 7 : 1))}
          aoMudarVisao={(novaVisao) => navegar(referencia, novaVisao)}
        />
      }
    >
      <title>{`${titulo} · SyncTempo`}</title>

      {participacoes.isPending ? (
        <div className={estilos.estado}>
          <Carregando texto="Carregando seus calendários…" />
        </div>
      ) : participacoes.isError ? (
        <div className={estilos.estado}>
          <ErroCarregamento
            erro={descreverErro('Não foi possível carregar seus calendários.', participacoes.error)}
            aoTentarNovamente={() => participacoes.refetch()}
          />
        </div>
      ) : calendarios.length === 0 ? (
        <div className={estilos.estado}>
          <Vazio texto="Você ainda não tem calendários. Crie um para começar a adicionar eventos.">
            <BotaoLink to="/calendarios/novo" variante="primario">
              Criar calendário
            </BotaoLink>
          </Vazio>
        </div>
      ) : (
        <>
          <div className={estilos.avisos}>
            <p role="status" className={estilos.aviso}>
              {aviso}
            </p>
            <p role="status" className={estilos.situacao}>
              {situacao}
            </p>
            {editaveis.length === 0 && (
              <p className={estilos.situacao}>
                Você só pode ver os eventos destes calendários. Para criar eventos, peça a um administrador o
                papel de Editor ou crie um calendário seu.
              </p>
            )}
            {falhas.map(({ calendario, consulta }) => (
              <ErroCarregamento
                key={calendario.calendarioId}
                erro={descreverErro(`Não foi possível carregar os eventos de '${calendario.nome}'.`, consulta.error)}
                aoTentarNovamente={() => consulta.refetch()}
              />
            ))}
          </div>
          <Grade
            dias={dias}
            eventos={eventosNaTela}
            podeCriar={editaveis.length > 0}
            aoCriar={abrirNovo}
            aoAbrir={(item) => {
              setAviso('')
              setDialogo({ tipo: 'detalhe', item })
            }}
            aoVerDia={(dia) => navegar(dia, 'dia')}
          />
        </>
      )}

      {dialogo?.tipo === 'novo' && (
        <FormularioEvento
          calendarios={editaveis}
          inicial={dialogo.inicial}
          aoFechar={() => setDialogo(null)}
          aoSalvo={aoSalvo}
        />
      )}
      {dialogo?.tipo === 'detalhe' && (
        <DetalheEvento
          item={dialogo.item}
          usuarioId={usuario?.id}
          aoEditar={(item) => setDialogo({ tipo: 'editar', item })}
          aoFechar={() => setDialogo(null)}
          aoExcluido={aoExcluido}
        />
      )}
      {dialogo?.tipo === 'editar' && (
        <FormularioEvento
          calendarios={[dialogo.item.calendario]}
          evento={dialogo.item.evento}
          aoFechar={() => setDialogo(null)}
          aoSalvo={aoSalvo}
        />
      )}
    </AppShell>
  )
}
