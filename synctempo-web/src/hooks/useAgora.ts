import { useEffect, useState } from 'react'

/** Data e hora atuais, atualizadas a cada minuto. */
export function useAgora(): Date {
  const [agora, setAgora] = useState(() => new Date())
  useEffect(() => {
    const intervalo = window.setInterval(() => setAgora(new Date()), 60_000)
    return () => window.clearInterval(intervalo)
  }, [])
  return agora
}
