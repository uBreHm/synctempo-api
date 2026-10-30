import { useId, useState, type FormEvent } from 'react'
import type { CalendarioResponse, CriarCalendarioRequest } from '../../types/calendario'
import type { DescricaoErro } from '../../utils/erros'
import { exigirTexto, limitar, textoOuNulo, validarCor, type Erros } from '../../utils/validacao'
import { Botao } from '../comum/Botao'
import { Campo } from '../comum/Campo'
import { MensagemErro } from '../comum/Estados'
import pagina from '../../pages/Pagina.module.css'

export const COR_PADRAO = '#0f6b5c'

type CampoCalendario = keyof CriarCalendarioRequest
const ORDEM: CampoCalendario[] = ['nome', 'descricao', 'cor']

interface Props {
  inicial?: CalendarioResponse
  rotuloEnviar: string
  pendente: boolean
  erro: DescricaoErro | null
  aoEnviar: (request: CriarCalendarioRequest) => void
}

/** Campos de CriarCalendarioRequest, usado no POST e no PUT de /calendarios. */
export function FormularioCalendario({ inicial, rotuloEnviar, pendente, erro, aoEnviar }: Props) {
  const id = useId()
  const [nome, setNome] = useState(inicial?.nome ?? '')
  const [descricao, setDescricao] = useState(inicial?.descricao ?? '')
  const [cor, setCor] = useState((inicial?.cor ?? COR_PADRAO).toLowerCase())
  const [erros, setErros] = useState<Erros<CampoCalendario>>({})
  const idCampo = (campo: CampoCalendario) => `${id}-${campo}`

  function enviar(e: FormEvent) {
    e.preventDefault()
    const novosErros: Erros<CampoCalendario> = {
      nome: exigirTexto(nome, 'Informe o nome do calendário.', 120),
      descricao: limitar(descricao.trim(), 1000),
      cor: validarCor(cor),
    }
    setErros(novosErros)
    const primeiro = ORDEM.find((campo) => novosErros[campo])
    if (primeiro) {
      document.getElementById(idCampo(primeiro))?.focus()
      return
    }
    aoEnviar({ nome: nome.trim(), descricao: textoOuNulo(descricao), cor })
  }

  return (
    <form className={pagina.formulario} onSubmit={enviar} noValidate>
      <Campo id={idCampo('nome')} rotulo="Nome" erro={erros.nome}>
        {(atributos) => (
          <input {...atributos} type="text" maxLength={120} value={nome} onChange={(e) => setNome(e.target.value)} />
        )}
      </Campo>
      <Campo id={idCampo('descricao')} rotulo="Descrição" opcional erro={erros.descricao}>
        {(atributos) => (
          <textarea
            {...atributos}
            rows={3}
            maxLength={1000}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />
        )}
      </Campo>
      <Campo id={idCampo('cor')} rotulo="Cor" dica="Marca os eventos deste calendário na agenda." erro={erros.cor}>
        {(atributos) => (
          <div className={pagina.acoes}>
            <input {...atributos} type="color" value={cor} onChange={(e) => setCor(e.target.value)} />
            <span className={pagina.secundario}>{cor.toUpperCase()}</span>
          </div>
        )}
      </Campo>
      {erro && <MensagemErro erro={erro} />}
      <div className={pagina.acoes}>
        <Botao type="submit" variante="primario" disabled={pendente} aria-busy={pendente}>
          {rotuloEnviar}
        </Botao>
      </div>
    </form>
  )
}
