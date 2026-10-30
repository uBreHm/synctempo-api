import { ApiErro } from '../api/client'

export interface DescricaoErro {
  /** O que falhou, do ponto de vista de quem usa. */
  resumo: string
  /** Mensagem devolvida pela API, exibida sem alteração. */
  detalhe: string | null
  /** Como resolver. */
  orientacao: string
}

export type OrientacoesPorStatus = Partial<Record<number, string>>

export function descreverErro(
  resumo: string,
  erro: unknown,
  orientacoes: OrientacoesPorStatus = {},
): DescricaoErro {
  if (!(erro instanceof ApiErro)) {
    return { resumo, detalhe: null, orientacao: 'Recarregue a página e tente novamente.' }
  }
  if (erro.status === 0) {
    return { resumo, detalhe: null, orientacao: 'Verifique sua conexão e tente novamente.' }
  }
  return {
    resumo,
    detalhe: erro.message || null,
    orientacao: orientacoes[erro.status] ?? orientacaoPadrao(erro.status),
  }
}

function orientacaoPadrao(status: number): string {
  if (status === 400) return 'Revise os campos e tente novamente.'
  if (status === 401) return 'Entre novamente para continuar.'
  if (status === 403) return 'Peça a um administrador do calendário o acesso necessário.'
  if (status === 404) return 'O item pode ter sido excluído. Recarregue a página para ver a versão atual.'
  if (status === 409) return 'Revise os dados e tente novamente.'
  if (status === 429) return 'Aguarde alguns minutos e tente novamente.'
  if (status >= 500) return 'Tente novamente em alguns minutos.'
  return 'Tente novamente.'
}

export function statusDoErro(erro: unknown): number | null {
  return erro instanceof ApiErro ? erro.status : null
}
