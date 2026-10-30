import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { alterarMinhaSenha, atualizarMinhaConta, desativarMinhaConta, obterMinhaConta } from '../api/usuarios'
import type { AlterarSenhaRequest, AtualizarUsuarioRequest } from '../types/usuario'
import { chaves } from './chaves'

export function useMinhaConta() {
  return useQuery({ queryKey: chaves.minhaConta, queryFn: obterMinhaConta })
}

export function useAtualizarConta() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: AtualizarUsuarioRequest) => atualizarMinhaConta(request),
    onSuccess: (usuario) => {
      queryClient.setQueryData(chaves.minhaConta, usuario)
      queryClient.setQueryData(chaves.contaAutenticada, usuario)
    },
  })
}

export function useAlterarSenha() {
  return useMutation({ mutationFn: (request: AlterarSenhaRequest) => alterarMinhaSenha(request) })
}

export function useDesativarConta() {
  return useMutation({ mutationFn: desativarMinhaConta })
}
