import { useId, useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { Botao } from '../components/comum/Botao'
import { Campo } from '../components/comum/Campo'
import { ConfirmarExclusao } from '../components/comum/ConfirmarExclusao'
import { Carregando, ErroCarregamento, MensagemErro } from '../components/comum/Estados'
import { AppShell } from '../components/layout/AppShell'
import { useAlterarSenha, useAtualizarConta, useDesativarConta, useMinhaConta } from '../hooks/useConta'
import { useSessao } from '../hooks/useSessao'
import type { AlterarSenhaRequest, AtualizarUsuarioRequest, UsuarioResponse } from '../types/usuario'
import { descreverErro } from '../utils/erros'
import { exigir, exigirTexto, semErros, validarEmail, validarNovaSenha, type Erros } from '../utils/validacao'
import estilos from './Pagina.module.css'

export function Conta() {
  const conta = useMinhaConta()

  return (
    <AppShell>
      <div className={estilos.pagina}>
        <title>Minha conta · SyncTempo</title>
        <div className={estilos.cabecalho}>
          <Link to="/">Voltar para a agenda</Link>
          <h1>Minha conta</h1>
        </div>
        {conta.isPending ? (
          <Carregando texto="Carregando seus dados…" />
        ) : conta.isError ? (
          <ErroCarregamento
            erro={descreverErro('Não foi possível carregar seus dados.', conta.error)}
            aoTentarNovamente={() => conta.refetch()}
          />
        ) : (
          <>
            <SecaoDados usuario={conta.data} />
            <SecaoSenha />
            <SecaoDesativar />
          </>
        )}
      </div>
    </AppShell>
  )
}

function SecaoDados({ usuario }: { usuario: UsuarioResponse }) {
  const id = useId()
  const atualizar = useAtualizarConta()
  const [campos, setCampos] = useState<AtualizarUsuarioRequest>({ name: usuario.name, email: usuario.email })
  const [erros, setErros] = useState<Erros<keyof AtualizarUsuarioRequest>>({})

  function enviar(e: FormEvent) {
    e.preventDefault()
    const novosErros = { name: exigirTexto(campos.name, 'Informe seu nome.', 120), email: validarEmail(campos.email) }
    setErros(novosErros)
    if (!semErros(novosErros)) {
      document.getElementById(`${id}-${novosErros.name ? 'nome' : 'email'}`)?.focus()
      return
    }
    atualizar.mutate({ name: campos.name.trim(), email: campos.email.trim() })
  }

  return (
    <section aria-labelledby={`${id}-titulo`} className={estilos.secao}>
      <h2 id={`${id}-titulo`}>Dados da conta</h2>
      <form className={estilos.formulario} onSubmit={enviar} noValidate>
        <Campo id={`${id}-nome`} rotulo="Nome" erro={erros.name}>
          {(atributos) => (
            <input
              {...atributos}
              type="text"
              autoComplete="name"
              maxLength={120}
              value={campos.name}
              onChange={(e) => setCampos((atuais) => ({ ...atuais, name: e.target.value }))}
            />
          )}
        </Campo>
        <Campo id={`${id}-email`} rotulo="E-mail" erro={erros.email}>
          {(atributos) => (
            <input
              {...atributos}
              type="email"
              autoComplete="email"
              maxLength={320}
              value={campos.email}
              onChange={(e) => setCampos((atuais) => ({ ...atuais, email: e.target.value }))}
            />
          )}
        </Campo>
        {atualizar.isError && (
          <MensagemErro
            erro={descreverErro('Não foi possível salvar seus dados.', atualizar.error, {
              409: 'Esse e-mail já é usado por outra conta. Use outro e-mail.',
            })}
          />
        )}
        <div className={estilos.acoes}>
          <Botao type="submit" variante="primario" disabled={atualizar.isPending} aria-busy={atualizar.isPending}>
            Salvar dados
          </Botao>
        </div>
        <p role="status" className={estilos.status}>
          {atualizar.isSuccess ? 'Dados salvos.' : ''}
        </p>
      </form>
    </section>
  )
}

function SecaoSenha() {
  const id = useId()
  const alterar = useAlterarSenha()
  const [campos, setCampos] = useState<AlterarSenhaRequest>({ currentPassword: '', newPassword: '' })
  const [erros, setErros] = useState<Erros<keyof AlterarSenhaRequest>>({})

  function enviar(e: FormEvent) {
    e.preventDefault()
    const novosErros = {
      currentPassword: exigir(campos.currentPassword, 'Informe a senha atual.'),
      newPassword: validarNovaSenha(campos.newPassword),
    }
    setErros(novosErros)
    if (!semErros(novosErros)) {
      document.getElementById(`${id}-${novosErros.currentPassword ? 'atual' : 'nova'}`)?.focus()
      return
    }
    alterar.mutate(campos, { onSuccess: () => setCampos({ currentPassword: '', newPassword: '' }) })
  }

  return (
    <section aria-labelledby={`${id}-titulo`} className={estilos.secao}>
      <h2 id={`${id}-titulo`}>Senha</h2>
      <form className={estilos.formulario} onSubmit={enviar} noValidate>
        <Campo id={`${id}-atual`} rotulo="Senha atual" erro={erros.currentPassword}>
          {(atributos) => (
            <input
              {...atributos}
              type="password"
              autoComplete="current-password"
              value={campos.currentPassword}
              onChange={(e) => setCampos((atuais) => ({ ...atuais, currentPassword: e.target.value }))}
            />
          )}
        </Campo>
        <Campo id={`${id}-nova`} rotulo="Nova senha" dica="De 12 a 72 caracteres." erro={erros.newPassword}>
          {(atributos) => (
            <input
              {...atributos}
              type="password"
              autoComplete="new-password"
              maxLength={72}
              value={campos.newPassword}
              onChange={(e) => setCampos((atuais) => ({ ...atuais, newPassword: e.target.value }))}
            />
          )}
        </Campo>
        {alterar.isError && (
          <MensagemErro
            erro={descreverErro('Não foi possível alterar a senha.', alterar.error, {
              401: 'Confira a senha atual e tente novamente.',
            })}
          />
        )}
        <div className={estilos.acoes}>
          <Botao type="submit" variante="primario" disabled={alterar.isPending} aria-busy={alterar.isPending}>
            Alterar senha
          </Botao>
        </div>
        <p role="status" className={estilos.status}>
          {alterar.isSuccess ? 'Senha alterada.' : ''}
        </p>
      </form>
    </section>
  )
}

function SecaoDesativar() {
  const id = useId()
  const { sair } = useSessao()
  const desativar = useDesativarConta()
  const [confirmando, setConfirmando] = useState(false)

  return (
    <section aria-labelledby={`${id}-titulo`} className={estilos.secao}>
      <h2 id={`${id}-titulo`}>Desativar conta</h2>
      <p>Sua conta fica inativa e você sai do SyncTempo. Só um administrador do sistema pode reativá-la.</p>
      <div className={estilos.acoes}>
        <Botao onClick={() => setConfirmando(true)}>Desativar conta</Botao>
      </div>
      {confirmando && (
        <ConfirmarExclusao
          titulo="Desativar conta"
          mensagem="Desativar sua conta? Você sai agora e só um administrador do sistema pode reativá-la."
          rotuloConfirmar="Desativar"
          pendente={desativar.isPending}
          erro={
            desativar.isError
              ? descreverErro('Não foi possível desativar a conta.', desativar.error, {
                  409: 'Em cada calendário que você administra, promova outro membro a Administrador ou exclua o calendário. Depois tente de novo.',
                })
              : null
          }
          aoConfirmar={() => desativar.mutate(undefined, { onSuccess: sair })}
          aoManter={() => {
            desativar.reset()
            setConfirmando(false)
          }}
        />
      )}
    </section>
  )
}
