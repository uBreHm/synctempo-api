import { useCallback, useEffect, useState } from 'react'

const CHAVE = 'synctempo.calendariosOcultos'

function lerOcultos(): Set<number> {
  try {
    const bruto = localStorage.getItem(CHAVE)
    const ids: unknown = bruto ? JSON.parse(bruto) : []
    return new Set(Array.isArray(ids) ? ids.filter((id): id is number => typeof id === 'number') : [])
  } catch {
    return new Set()
  }
}

/** Calendários desmarcados na lateral. Preferência deste navegador, não vai para a API. */
export function useCalendariosOcultos() {
  const [ocultos, setOcultos] = useState(lerOcultos)

  useEffect(() => {
    try {
      localStorage.setItem(CHAVE, JSON.stringify([...ocultos]))
    } catch {
      // Sem armazenamento a preferência vale só até recarregar a página.
    }
  }, [ocultos])

  const alternar = useCallback((calendarioId: number) => {
    setOcultos((atuais) => {
      const proximos = new Set(atuais)
      if (proximos.has(calendarioId)) proximos.delete(calendarioId)
      else proximos.add(calendarioId)
      return proximos
    })
  }, [])

  return { ocultos, alternar }
}
