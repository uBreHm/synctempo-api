import { useMutation } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { cadastrar } from '../api/auth'
import { Botao } from '../components/comum/Botao'
import { Campo } from '../components/comum/Campo'
import { MensagemErro } from '../components/comum/Estados'
import type { EstadoEntrar } from '../components/sessao/RotaProtegida'
import { useSessao } from '../hooks/useSessao'
import type { RegisterRequest } from '../types/auth'
import { descreverErro } from '../utils/erros'
import { exigirTexto, validarEmail, validarNovaSenha, type Erros } from '../utils/validacao'
import estilos from './Autenticacao.module.css'

const IDS: Record<keyof RegisterRequest, string> = { name: 'nome', email: 'email', password: 'senha' }

export function Cadastro() {
  const { autenticado } = useSessao()
  const navigate = useNavigate()
  const [campos, setCampos] = useState<RegisterRequest>({ name: '', email: '', password: '' })
  const [erros, setErros] = useState<Erros<keyof RegisterRequest>>({})
  const cadastro = useMutation({
    mutationFn: cadastrar,
    onSuccess: (usuario) => {
      const estado: EstadoEntrar = { contaCriada: true, email: usuario.email }
      navigate('/entrar', { state: estado })
    },
  })

  if (autenticado) return <Navigate to="/" replace />

  function alterar(campo: keyof RegisterRequest, valor: string) {
    setCampos((atuais) => ({ ...atuais, [campo]: valor }))
  }

  function enviar(evento: FormEvent) {
    evento.preventDefault()
    const novosErros: Erros<keyof RegisterRequest> = {
      name: exigirTexto(campos.name, 'Informe seu nome.', 120),
      email: validarEmail(campos.email),
      password: validarNovaSenha(campos.password),
    }
    setErros(novosErros)
    const primeiro = (Object.keys(IDS) as (keyof RegisterRequest)[]).find((campo) => novosErros[campo])
    if (primeiro) {
      document.getElementById(IDS[primeiro])?.focus()
      return
    }
    cadastro.mutate({ name: campos.name.trim(), email: campos.email.trim(), password: campos.password })
  }

  return (
    <main className={estilos.tela}>
      <title>Criar conta · SyncTempo</title>
      <p className={estilos.marca}>SyncTempo</p>
      <h1>Criar conta</h1>

      <form className={estilos.formulario} onSubmit={enviar} noValidate>
        <Campo id={IDS.name} rotulo="Nome" erro={erros.name}>
          {(atributos) => (
            <input
              {...atributos}
              type="text"
              autoComplete="name"
              maxLength={120}
              value={campos.name}
              onChange={(e) => alterar('name', e.target.value)}
            />
          )}
        </Campo>
        <Campo id={IDS.email} rotulo="E-mail" erro={erros.email}>
          {(atributos) => (
            <input
              {...atributos}
              type="email"
              autoComplete="email"
              maxLength={320}
              value={campos.email}
              onChange={(e) => alterar('email', e.target.value)}
            />
          )}
        </Campo>
        <Campo id={IDS.password} rotulo="Senha" dica="De 12 a 72 caracteres." erro={erros.password}>
          {(atributos) => (
            <input
              {...atributos}
              type="password"
              autoComplete="new-password"
              maxLength={72}
              value={campos.password}
              onChange={(e) => alterar('password', e.target.value)}
            />
          )}
        </Campo>
        {cadastro.isError && (
          <MensagemErro
            erro={descreverErro('Não foi possível criar a conta.', cadastro.error, {
              409: 'Use outro e-mail ou entre com a conta que já existe.',
            })}
          />
        )}
        <Botao type="submit" variante="primario" disabled={cadastro.isPending} aria-busy={cadastro.isPending}>
          Criar conta
        </Botao>
      </form>

      <p>
        Já tem conta? <Link to="/entrar">Entrar</Link>
      </p>
    </main>
  )
}
