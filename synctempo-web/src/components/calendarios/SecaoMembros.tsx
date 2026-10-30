import { useEffect, useId, useState } from 'react'
import { useNavigate } from 'react-router'
import { useAtraso } from '../../hooks/useAtraso'
import { useAlterarPapel, useMembros, useRemoverMembro } from '../../hooks/useMembros'
import type { PapelCalendario } from '../../types/enums'
import type { MembroResponse } from '../../types/membro'
import { deLocalDate, formatarDataCurta } from '../../utils/datas'
import { descreverErro } from '../../utils/erros'
import { PAPEIS, podeAdministrar, ROTULO_PAPEL } from '../../utils/rotulos'
import { Botao } from '../comum/Botao'
import { Campo } from '../comum/Campo'
import { ConfirmarExclusao } from '../comum/ConfirmarExclusao'
import { Carregando, ErroCarregamento, MensagemErro, Vazio } from '../comum/Estados'
import pagina from '../../pages/Pagina.module.css'
import { FormularioMembro } from './FormularioMembro'

interface Props {
  calendarioId: number
  papel: PapelCalendario | undefined
  usuarioId: number | undefined
}

export function SecaoMembros({ calendarioId, papel, usuarioId }: Props) {
  const idTitulo = useId()
  const idBusca = useId()
  const navigate = useNavigate()
  const [busca, setBusca] = useState('')
  const termo = useAtraso(busca.trim())
  const [paginaAtual, setPaginaAtual] = useState(0)
  const membros = useMembros(calendarioId, termo, paginaAtual)
  const alterarPapel = useAlterarPapel(calendarioId)
  const remover = useRemoverMembro(calendarioId)
  const [removendo, setRemovendo] = useState<MembroResponse | null>(null)
  const [aviso, setAviso] = useState('')
  const admin = podeAdministrar(papel)

  // Depois de uma remoção, a página atual pode deixar de existir.
  const totalPaginas = membros.data?.totalPages
  useEffect(() => {
    if (totalPaginas && paginaAtual >= totalPaginas) setPaginaAtual(totalPaginas - 1)
  }, [totalPaginas, paginaAtual])

  const nomeAlterado = membros.data?.data.find((membro) => membro.id === alterarPapel.variables?.id)?.nome

  function mudarPapel(membro: MembroResponse, novoPapel: PapelCalendario) {
    setAviso('')
    alterarPapel.mutate(
      { id: membro.id, papel: novoPapel },
      { onSuccess: (atualizado) => setAviso(`${atualizado.nome} agora é ${ROTULO_PAPEL[atualizado.papel]}.`) },
    )
  }

  function confirmarRemocao(membro: MembroResponse) {
    remover.mutate(membro.id, {
      onSuccess: () => {
        setRemovendo(null)
        if (membro.usuarioId === usuarioId) navigate('/', { replace: true })
        else setAviso(`${membro.nome} não participa mais deste calendário.`)
      },
    })
  }

  return (
    <section aria-labelledby={idTitulo} className={pagina.secao}>
      <h2 id={idTitulo}>Membros</h2>
      {admin && (
        <FormularioMembro
          calendarioId={calendarioId}
          aoAdicionado={(membro) => setAviso(`${membro.nome} agora participa como ${ROTULO_PAPEL[membro.papel]}.`)}
        />
      )}

      <div className={pagina.formulario}>
        <Campo id={idBusca} rotulo="Buscar por nome ou e-mail">
          {(atributos) => (
            <input
              {...atributos}
              type="search"
              value={busca}
              onChange={(e) => {
                setBusca(e.target.value)
                setPaginaAtual(0)
              }}
            />
          )}
        </Campo>
      </div>

      <p role="status" className={pagina.status}>
        {aviso}
      </p>
      {alterarPapel.isError && (
        <MensagemErro
          erro={descreverErro(`Não foi possível alterar o papel de ${nomeAlterado ?? 'este membro'}.`, alterarPapel.error, {
            409: 'Promova outro membro a Administrador antes de mudar o papel deste.',
          })}
        />
      )}

      {membros.isPending ? (
        <Carregando texto="Carregando membros…" />
      ) : membros.isError ? (
        <ErroCarregamento
          erro={descreverErro('Não foi possível carregar os membros.', membros.error)}
          aoTentarNovamente={() => membros.refetch()}
        />
      ) : membros.data.data.length === 0 ? (
        <Vazio
          texto={
            termo
              ? `Nenhum membro encontrado para “${termo}”. Confira o nome ou o e-mail buscado.`
              : 'Nenhum membro neste calendário.'
          }
        />
      ) : (
        <>
          <div className={pagina.tabelaRolagem}>
            <table className={pagina.tabela}>
              <caption className="sr-only">Membros do calendário</caption>
              <thead>
                <tr>
                  <th scope="col">Nome</th>
                  <th scope="col">E-mail</th>
                  <th scope="col">Papel</th>
                  <th scope="col">Entrou em</th>
                  {admin && (
                    <th scope="col">
                      <span className="sr-only">Ações</span>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {membros.data.data.map((membro) => (
                  <tr key={membro.id}>
                    <td>
                      {membro.nome}
                      {membro.usuarioId === usuarioId && <span className={pagina.secundario}> (você)</span>}
                    </td>
                    <td>{membro.email}</td>
                    <td>
                      {admin ? (
                        <select
                          aria-label={`Papel de ${membro.nome}`}
                          value={membro.papel}
                          disabled={alterarPapel.isPending && alterarPapel.variables.id === membro.id}
                          onChange={(e) => mudarPapel(membro, e.target.value as PapelCalendario)}
                        >
                          {PAPEIS.map((opcao) => (
                            <option key={opcao} value={opcao}>
                              {ROTULO_PAPEL[opcao]}
                            </option>
                          ))}
                        </select>
                      ) : (
                        ROTULO_PAPEL[membro.papel]
                      )}
                    </td>
                    <td>{formatarDataCurta(deLocalDate(membro.entrouEm.slice(0, 10)))}</td>
                    {admin && (
                      <td>
                        <Botao
                          variante="texto"
                          aria-label={`Remover ${membro.nome}`}
                          onClick={() => {
                            setAviso('')
                            setRemovendo(membro)
                          }}
                        >
                          Remover
                        </Botao>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {membros.data.totalPages > 1 && (
            <div className={pagina.paginacao}>
              <Botao disabled={paginaAtual === 0} onClick={() => setPaginaAtual((atual) => atual - 1)}>
                Página anterior
              </Botao>
              <span>
                Página {paginaAtual + 1} de {membros.data.totalPages}
              </span>
              <Botao
                disabled={paginaAtual + 1 >= membros.data.totalPages}
                onClick={() => setPaginaAtual((atual) => atual + 1)}
              >
                Próxima página
              </Botao>
            </div>
          )}
        </>
      )}

      {removendo && (
        <ConfirmarExclusao
          titulo="Remover membro"
          mensagem={`Remover '${removendo.nome}' deste calendário? A pessoa perde o acesso aos eventos dele até ser adicionada de novo.`}
          rotuloConfirmar="Remover"
          pendente={remover.isPending}
          erro={
            remover.isError
              ? descreverErro(`Não foi possível remover ${removendo.nome}.`, remover.error, {
                  409: 'Promova outro membro a Administrador antes de remover este.',
                })
              : null
          }
          aoConfirmar={() => confirmarRemocao(removendo)}
          aoManter={() => {
            remover.reset()
            setRemovendo(null)
          }}
        />
      )}
    </section>
  )
}
