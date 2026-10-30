import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { listarUsuarios, reativarUsuario } from '../api/admin'
import { chaves } from './chaves'

export const USUARIOS_POR_PAGINA = 20

export function useUsuariosAdmin(page: number) {
  return useQuery({
    queryKey: chaves.usuariosAdminPagina(page),
    queryFn: () => listarUsuarios(page, USUARIOS_POR_PAGINA),
    placeholderData: keepPreviousData,
  })
}

export function useReativarUsuario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => reativarUsuario(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chaves.usuariosAdmin }),
  })
}
