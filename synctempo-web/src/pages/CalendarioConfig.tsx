import { Link, useLocation, useParams } from 'react-router'
import { SecaoCategorias } from '../components/calendarios/SecaoCategorias'
import { SecaoDetalhes } from '../components/calendarios/SecaoDetalhes'
import { SecaoMembros } from '../components/calendarios/SecaoMembros'
import { Carregando, ErroCarregamento } from '../components/comum/Estados'
import { AppShell } from '../components/layout/AppShell'
import { useCalendario } from '../hooks/useCalendarios'
import { useParticipacoes } from '../hooks/useParticipacoes'
import { useSessao } from '../hooks/useSessao'
import { descreverErro } from '../utils/erros'
import { ROTULO_PAPEL } from '../utils/rotulos'
import { NaoEncontrada } from './NaoEncontrada'
import estilos from './Pagina.module.css'

export interface EstadoConfiguracao {
  /** Chegou aqui logo depois de criar o calendário. */
  criado?: boolean
}

export function CalendarioConfig() {
  const { id } = useParams()
  const calendarioId = Number(id)
  if (!Number.isInteger(calendarioId) || calendarioId <= 0) return <NaoEncontrada />
  return <Configuracao key={calendarioId} calendarioId={calendarioId} />
}

function Configuracao({ calendarioId }: { calendarioId: number }) {
  const estado = (useLocation().state ?? {}) as EstadoConfiguracao
  const { usuario } = useSessao()
  const calendario = useCalendario(calendarioId)
  const participacoes = useParticipacoes()
  const papel = participacoes.data?.find((participacao) => participacao.calendarioId === calendarioId)?.papel

  return (
    <AppShell>
      <div className={estilos.pagina}>
        <title>{`${calendario.data?.nome ?? 'Calendário'} · SyncTempo`}</title>
        <div className={estilos.cabecalho}>
          <Link to="/">Voltar para a agenda</Link>
          {calendario.isSuccess && (
            <>
              <h1>{calendario.data.nome}</h1>
              {papel && <p className={estilos.secundario}>Seu papel: {ROTULO_PAPEL[papel]}</p>}
            </>
          )}
        </div>

        {estado.criado && (
          <p role="status" className={estilos.status}>
            Calendário criado. Adicione categorias e membros ou volte para a agenda.
          </p>
        )}

        {calendario.isPending || participacoes.isPending ? (
          <Carregando texto="Carregando calendário…" />
        ) : calendario.isError ? (
          <ErroCarregamento
            erro={descreverErro('Não foi possível carregar este calendário.', calendario.error, {
              403: 'Você não participa deste calendário. Peça a um administrador dele para adicionar você.',
              404: 'Ele pode ter sido excluído. Volte para a agenda.',
            })}
            aoTentarNovamente={() => calendario.refetch()}
          />
        ) : (
          <>
            <SecaoDetalhes calendario={calendario.data} papel={papel} />
            <SecaoCategorias calendarioId={calendarioId} papel={papel} />
            <SecaoMembros calendarioId={calendarioId} papel={papel} usuarioId={usuario?.id} />
          </>
        )}
      </div>
    </AppShell>
  )
}
