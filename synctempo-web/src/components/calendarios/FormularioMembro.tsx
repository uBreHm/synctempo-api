import { useId, useState, type FormEvent } from 'react'
import { useAdicionarMembro } from '../../hooks/useMembros'
import type { PapelCalendario } from '../../types/enums'
import type { MembroResponse } from '../../types/membro'
import { descreverErro } from '../../utils/erros'
import { PAPEIS, ROTULO_PAPEL } from '../../utils/rotulos'
import { validarEmail } from '../../utils/validacao'
import { Botao } from '../comum/Botao'
import { Campo } from '../comum/Campo'
import { MensagemErro } from '../comum/Estados'
import pagina from '../../pages/Pagina.module.css'

interface Props {
  calendarioId: number
  aoAdicionado: (membro: MembroResponse) => void
}

export function FormularioMembro({ calendarioId, aoAdicionado }: Props) {
  const id = useId()
  const adicionar = useAdicionarMembro(calendarioId)
  const [email, setEmail] = useState('')
  const [papel, setPapel] = useState<PapelCalendario>('LEITOR')
  const [erroEmail, setErroEmail] = useState<string | undefined>()

  function enviar(e: FormEvent) {
    e.preventDefault()
    const erro = validarEmail(email)
    setErroEmail(erro)
    if (erro) {
      document.getElementById(`${id}-email`)?.focus()
      return
    }
    adicionar.mutate(
      { email: email.trim(), papel },
      {
        onSuccess: (membro) => {
          setEmail('')
          aoAdicionado(membro)
        },
      },
    )
  }

  return (
    <form className={pagina.formulario} onSubmit={enviar} noValidate>
      <div className={pagina.linhaCampos}>
        <Campo id={`${id}-email`} rotulo="E-mail da pessoa" erro={erroEmail}>
          {(atributos) => (
            <input
              {...atributos}
              type="email"
              autoComplete="off"
              maxLength={320}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          )}
        </Campo>
        <div className={pagina.encolher}>
          <Campo id={`${id}-papel`} rotulo="Papel">
            {(atributos) => (
              <select {...atributos} value={papel} onChange={(e) => setPapel(e.target.value as PapelCalendario)}>
                {PAPEIS.map((opcao) => (
                  <option key={opcao} value={opcao}>
                    {ROTULO_PAPEL[opcao]}
                  </option>
                ))}
              </select>
            )}
          </Campo>
        </div>
        <div className={pagina.encolher}>
          <Botao type="submit" variante="primario" disabled={adicionar.isPending} aria-busy={adicionar.isPending}>
            Adicionar membro
          </Botao>
        </div>
      </div>
      {adicionar.isError && (
        <MensagemErro
          erro={descreverErro('Não foi possível adicionar o membro.', adicionar.error, {
            404: 'Confira o e-mail. A pessoa precisa ter uma conta ativa no SyncTempo.',
            409: 'Essa pessoa já participa deste calendário.',
          })}
        />
      )}
    </form>
  )
}
