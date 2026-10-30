import { useId, useState, type FormEvent } from 'react'
import { useSalvarCategoria } from '../../hooks/useCategorias'
import type { CategoriaRequest, CategoriaResponse } from '../../types/categoria'
import { descreverErro } from '../../utils/erros'
import { exigirTexto, validarCor, type Erros } from '../../utils/validacao'
import { Botao } from '../comum/Botao'
import { Campo } from '../comum/Campo'
import { MensagemErro } from '../comum/Estados'
import pagina from '../../pages/Pagina.module.css'
import { COR_PADRAO } from './FormularioCalendario'

interface Props {
  calendarioId: number
  /** Presente na edição. */
  categoria?: CategoriaResponse
  rotuloEnviar: string
  aoConcluir: (categoria: CategoriaResponse) => void
  aoCancelar?: () => void
}

export function FormularioCategoria({ calendarioId, categoria, rotuloEnviar, aoConcluir, aoCancelar }: Props) {
  const id = useId()
  const salvar = useSalvarCategoria()
  const [nome, setNome] = useState(categoria?.nome ?? '')
  const [cor, setCor] = useState((categoria?.cor ?? COR_PADRAO).toLowerCase())
  const [erros, setErros] = useState<Erros<keyof CategoriaRequest>>({})

  function enviar(e: FormEvent) {
    e.preventDefault()
    const novosErros = { nome: exigirTexto(nome, 'Informe o nome da categoria.', 80), cor: validarCor(cor) }
    setErros(novosErros)
    if (novosErros.nome || novosErros.cor) {
      document.getElementById(`${id}-${novosErros.nome ? 'nome' : 'cor'}`)?.focus()
      return
    }
    salvar.mutate(
      { calendarioId, id: categoria?.id, request: { nome: nome.trim(), cor } },
      {
        onSuccess: (salva) => {
          if (!categoria) setNome('')
          aoConcluir(salva)
        },
      },
    )
  }

  return (
    <form className={pagina.formulario} onSubmit={enviar} noValidate>
      <div className={pagina.linhaCampos}>
        <Campo id={`${id}-nome`} rotulo="Nome da categoria" erro={erros.nome}>
          {(atributos) => (
            <input
              {...atributos}
              type="text"
              maxLength={80}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              autoFocus={categoria !== undefined}
            />
          )}
        </Campo>
        <div className={pagina.encolher}>
          <Campo id={`${id}-cor`} rotulo="Cor" erro={erros.cor}>
            {(atributos) => <input {...atributos} type="color" value={cor} onChange={(e) => setCor(e.target.value)} />}
          </Campo>
        </div>
        <div className={`${pagina.acoes} ${pagina.encolher}`}>
          <Botao type="submit" variante="primario" disabled={salvar.isPending} aria-busy={salvar.isPending}>
            {rotuloEnviar}
          </Botao>
          {aoCancelar && <Botao onClick={aoCancelar}>Cancelar</Botao>}
        </div>
      </div>
      {salvar.isError && (
        <MensagemErro
          erro={descreverErro(
            categoria ? 'Não foi possível salvar a categoria.' : 'Não foi possível adicionar a categoria.',
            salvar.error,
            { 409: 'Já existe uma categoria com esse nome neste calendário. Use outro nome.' },
          )}
        />
      )}
    </form>
  )
}
