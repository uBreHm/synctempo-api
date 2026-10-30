import { useEffect, useState } from 'react'

/** Devolve `valor` só depois de `ms` sem mudanças (ex.: busca enquanto digita). */
export function useAtraso<T>(valor: T, ms = 300): T {
  const [atrasado, setAtrasado] = useState(valor)
  useEffect(() => {
    const espera = window.setTimeout(() => setAtrasado(valor), ms)
    return () => window.clearTimeout(espera)
  }, [valor, ms])
  return atrasado
}
