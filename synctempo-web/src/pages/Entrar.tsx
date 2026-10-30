import { useMutation } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation } from 'react-router'
import { Botao } from '../components/comum/Botao'
import { Campo } from '../components/comum/Campo'
import { MensagemErro } from '../components/comum/Estados'
import type { EstadoEntrar } from '../components/sessao/RotaProtegida'
import { useSessao } from '../hooks/useSessao'
import type { LoginRequest } from '../types/auth'
import { descreverErro } from '../utils/erros'
import { exigir, semErros, validarEmail, type Erros } from '../utils/validacao'
import estilos from './Autenticacao.module.css'

export function Entrar() {
  const { autenticado, expirou, entrar } = useSessao()
  const estado = (useLocation().state ?? {}) as EstadoEntrar
  const [email, setEmail] = useState(estado.email ?? '')
  const [password, setPassword] = useState('')
  const [erros, setErros] = useState<Erros<keyof LoginRequest>>({})
  const login = useMutation({ mutationFn: entrar })

  if (autenticado) return <Navigate to={estado.de ?? '/'} replace />

  function enviar(evento: FormEvent) {
    evento.preventDefault()
    const novosErros = { email: validarEmail(email), password: exigir(password, 'Informe a senha.') }
    setErros(novosErros)
    if (!semErros(novosErros)) {
      document.getElementById(novosErros.email ? 'email' : 'senha')?.focus()
      return
    }
    login.mutate({ email: email.trim(), password })
  }

  return (
    <main className={estilos.tela}>
      <title>Entrar · SyncTempo</title>
      <p className={estilos.marca}>SyncTempo</p>
      <h1>Entrar</h1>

      {expirou && (
        <p role="status" className={estilos.aviso}>
          Sua sessão expirou. Entre novamente para continuar.
        </p>
      )}
      {estado.contaCriada && (
        <p role="status" className={estilos.aviso}>
          Conta criada. Entre com seu e-mail e senha.
        </p>
      )}

      <form className={estilos.formulario} onSubmit={enviar} noValidate>
        <Campo id="email" rotulo="E-mail" erro={erros.email}>
          {(atributos) => (
            <input
              {...atributos}
              type="email"
              autoComplete="email"
              maxLength={320}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          )}
        </Campo>
        <Campo id="senha" rotulo="Senha" erro={erros.password}>
          {(atributos) => (
            <input
              {...atributos}
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          )}
        </Campo>
        {login.isError && (
          <MensagemErro
            erro={descreverErro('Não foi possível entrar.', login.error, {
              401: 'Confira o e-mail e a senha e tente novamente.',
              429: 'Muitas tentativas seguidas. Aguarde alguns minutos e tente novamente.',
            })}
          />
        )}
        <Botao type="submit" variante="primario" disabled={login.isPending} aria-busy={login.isPending}>
          Entrar
        </Botao>
      </form>

      <p>
        Ainda não tem conta? <Link to="/cadastro">Criar conta</Link>
      </p>
    </main>
  )
}
