import { Link, useNavigate } from 'react-router'
import { FormularioCalendario } from '../components/calendarios/FormularioCalendario'
import { AppShell } from '../components/layout/AppShell'
import { useCriarCalendario } from '../hooks/useCalendarios'
import { descreverErro } from '../utils/erros'
import type { EstadoConfiguracao } from './CalendarioConfig'
import estilos from './Pagina.module.css'

export function CalendarioNovo() {
  const navigate = useNavigate()
  const criar = useCriarCalendario()

  return (
    <AppShell>
      <div className={estilos.pagina}>
        <title>Criar calendário · SyncTempo</title>
        <div className={estilos.cabecalho}>
          <Link to="/">Voltar para a agenda</Link>
          <h1>Criar calendário</h1>
          <p className={estilos.secundario}>Você será o administrador do novo calendário.</p>
        </div>
        <FormularioCalendario
          rotuloEnviar="Criar calendário"
          pendente={criar.isPending}
          erro={criar.isError ? descreverErro('Não foi possível criar o calendário.', criar.error) : null}
          aoEnviar={(request) =>
            criar.mutate(request, {
              onSuccess: (calendario) => {
                const estado: EstadoConfiguracao = { criado: true }
                navigate(`/calendarios/${calendario.id}`, { state: estado })
              },
            })
          }
        />
      </div>
    </AppShell>
  )
}
