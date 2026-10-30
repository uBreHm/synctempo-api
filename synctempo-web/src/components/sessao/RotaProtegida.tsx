import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { useSessao } from '../../hooks/useSessao'

export interface EstadoEntrar {
  /** Rota para voltar depois de entrar. */
  de?: string
  /** E-mail recém-cadastrado, para preencher o formulário. */
  email?: string
  contaCriada?: boolean
}

export function RotaProtegida({ children }: { children: ReactNode }) {
  const { autenticado } = useSessao()
  const location = useLocation()
  if (!autenticado) {
    const estado: EstadoEntrar = { de: location.pathname + location.search }
    return <Navigate to="/entrar" replace state={estado} />
  }
  return children
}
