import { useId, useState } from 'react'
import { useCategorias, useExcluirCategoria } from '../../hooks/useCategorias'
import type { CategoriaResponse } from '../../types/categoria'
import type { PapelCalendario } from '../../types/enums'
import { descreverErro } from '../../utils/erros'
import { podeEditar } from '../../utils/rotulos'
import { Botao } from '../comum/Botao'
import { ConfirmarExclusao } from '../comum/ConfirmarExclusao'
import { Carregando, ErroCarregamento, Vazio } from '../comum/Estados'
import pagina from '../../pages/Pagina.module.css'
import { FormularioCategoria } from './FormularioCategoria'

interface Props {
  calendarioId: number
  papel: PapelCalendario | undefined
}

export function SecaoCategorias({ calendarioId, papel }: Props) {
  const idTitulo = useId()
  const categorias = useCategorias(calendarioId)
  const excluir = useExcluirCategoria()
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [excluindo, setExcluindo] = useState<CategoriaResponse | null>(null)
  const [aviso, setAviso] = useState('')
  const editavel = podeEditar(papel)

  return (
    <section aria-labelledby={idTitulo} className={pagina.secao}>
      <h2 id={idTitulo}>Categorias</h2>
      {editavel && (
        <FormularioCategoria
          calendarioId={calendarioId}
          rotuloEnviar="Adicionar categoria"
          aoConcluir={(categoria) => setAviso(`Categoria '${categoria.nome}' adicionada.`)}
        />
      )}
      <p role="status" className={pagina.status}>
        {aviso}
      </p>

      {categorias.isPending ? (
        <Carregando texto="Carregando categorias…" />
      ) : categorias.isError ? (
        <ErroCarregamento
          erro={descreverErro('Não foi possível carregar as categorias.', categorias.error)}
          aoTentarNovamente={() => categorias.refetch()}
        />
      ) : categorias.data.length === 0 ? (
        <Vazio
          texto={
            editavel
              ? 'Nenhuma categoria neste calendário. Adicione uma para classificar os eventos.'
              : 'Nenhuma categoria neste calendário.'
          }
        />
      ) : (
        <ul className={pagina.lista}>
          {categorias.data.map((categoria) => (
            <li key={categoria.id} className={pagina.itemLista}>
              {editandoId === categoria.id ? (
                <div className={pagina.crescer}>
                  <FormularioCategoria
                    calendarioId={calendarioId}
                    categoria={categoria}
                    rotuloEnviar="Salvar categoria"
                    aoConcluir={(salva) => {
                      setEditandoId(null)
                      setAviso(`Categoria '${salva.nome}' salva.`)
                    }}
                    aoCancelar={() => setEditandoId(null)}
                  />
                </div>
              ) : (
                <>
                  <span className={pagina.amostraCor} style={{ background: categoria.cor }} />
                  <span className={pagina.crescer}>{categoria.nome}</span>
                  {editavel && (
                    <>
                      <Botao
                        variante="texto"
                        aria-label={`Editar categoria ${categoria.nome}`}
                        onClick={() => {
                          setAviso('')
                          setEditandoId(categoria.id)
                        }}
                      >
                        Editar
                      </Botao>
                      <Botao
                        variante="texto"
                        aria-label={`Excluir categoria ${categoria.nome}`}
                        onClick={() => setExcluindo(categoria)}
                      >
                        Excluir
                      </Botao>
                    </>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      {excluindo && (
        <ConfirmarExclusao
          titulo="Excluir categoria"
          mensagem={`Excluir a categoria '${excluindo.nome}'? Ela será removida dos eventos que a usam. Isso não pode ser desfeito.`}
          pendente={excluir.isPending}
          erro={excluir.isError ? descreverErro('Não foi possível excluir a categoria.', excluir.error) : null}
          aoConfirmar={() =>
            excluir.mutate(
              { calendarioId, id: excluindo.id },
              {
                onSuccess: () => {
                  setAviso(`Categoria '${excluindo.nome}' excluída.`)
                  setExcluindo(null)
                },
              },
            )
          }
          aoManter={() => {
            excluir.reset()
            setExcluindo(null)
          }}
        />
      )}
    </section>
  )
}
