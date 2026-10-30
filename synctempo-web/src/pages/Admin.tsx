import { useState } from 'react'
import { Link } from 'react-router'
import { Botao } from '../components/comum/Botao'
import { Carregando, ErroCarregamento, MensagemErro, Vazio } from '../components/comum/Estados'
import { AppShell } from '../components/layout/AppShell'
import { useReativarUsuario, useUsuariosAdmin } from '../hooks/useAdmin'
import { descreverErro, statusDoErro } from '../utils/erros'
import { ROTULO_PERFIL } from '../utils/rotulos'
import estilos from './Pagina.module.css'

// Sem link no menu: a API não informa o perfil da conta autenticada (ver Pendências da API).
export function Admin() {
  const [paginaAtual, setPaginaAtual] = useState(0)
  const usuarios = useUsuariosAdmin(paginaAtual)
  const reativar = useReativarUsuario()
  const [aviso, setAviso] = useState('')

  const erroCarregamento = usuarios.isError
    ? descreverErro('Não foi possível carregar as contas.', usuarios.error, {
        403: 'Esta página é só para administradores do sistema. Volte para a agenda.',
      })
    : null

  return (
    <AppShell>
      <div className={estilos.pagina}>
        <title>Contas do sistema · SyncTempo</title>
        <div className={estilos.cabecalho}>
          <Link to="/">Voltar para a agenda</Link>
          <h1>Contas do sistema</h1>
          <p className={estilos.secundario}>Contas desativadas pelos próprios usuários podem ser reativadas aqui.</p>
        </div>

        <p role="status" className={estilos.status}>
          {aviso}
        </p>
        {reativar.isError && (
          <MensagemErro erro={descreverErro('Não foi possível reativar a conta.', reativar.error)} />
        )}

        {usuarios.isPending ? (
          <Carregando texto="Carregando contas…" />
        ) : erroCarregamento ? (
          statusDoErro(usuarios.error) === 403 ? (
            <MensagemErro erro={erroCarregamento} />
          ) : (
            <ErroCarregamento erro={erroCarregamento} aoTentarNovamente={() => usuarios.refetch()} />
          )
        ) : !usuarios.data || usuarios.data.data.length === 0 ? (
          <Vazio texto="Nenhuma conta cadastrada." />
        ) : (
          <>
            <div className={estilos.tabelaRolagem}>
              <table className={estilos.tabela}>
                <caption className="sr-only">Contas do sistema</caption>
                <thead>
                  <tr>
                    <th scope="col">Nome</th>
                    <th scope="col">E-mail</th>
                    <th scope="col">Perfil</th>
                    <th scope="col">Situação</th>
                    <th scope="col">
                      <span className="sr-only">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.data.data.map((usuario) => (
                    <tr key={usuario.id}>
                      <td>{usuario.nome}</td>
                      <td>{usuario.email}</td>
                      <td>{ROTULO_PERFIL[usuario.perfil]}</td>
                      <td>{usuario.ativo ? 'Ativa' : 'Desativada'}</td>
                      <td>
                        {!usuario.ativo && (
                          <Botao
                            variante="texto"
                            aria-label={`Reativar conta de ${usuario.nome}`}
                            disabled={reativar.isPending && reativar.variables === usuario.id}
                            onClick={() => {
                              setAviso('')
                              reativar.mutate(usuario.id, {
                                onSuccess: () => setAviso(`Conta de ${usuario.nome} reativada.`),
                              })
                            }}
                          >
                            Reativar conta
                          </Botao>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {usuarios.data.totalPages > 1 && (
              <div className={estilos.paginacao}>
                <Botao disabled={paginaAtual === 0} onClick={() => setPaginaAtual((atual) => atual - 1)}>
                  Página anterior
                </Botao>
                <span>
                  Página {paginaAtual + 1} de {usuarios.data.totalPages}
                </span>
                <Botao
                  disabled={paginaAtual + 1 >= usuarios.data.totalPages}
                  onClick={() => setPaginaAtual((atual) => atual + 1)}
                >
                  Próxima página
                </Botao>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  )
}
