// Chaves de cache do TanStack Query, uma por recurso da API.
export const chaves = {
  contaAutenticada: ['contaAutenticada'] as const,
  minhaConta: ['minhaConta'] as const,
  participacoes: ['participacoes'] as const,
  calendario: (id: number) => ['calendario', id] as const,
  eventos: (calendarioId: number) => ['eventos', calendarioId] as const,
  evento: (calendarioId: number, id: number) => ['evento', calendarioId, id] as const,
  categorias: (calendarioId: number) => ['categorias', calendarioId] as const,
  membros: (calendarioId: number) => ['membros', calendarioId] as const,
  membrosPagina: (calendarioId: number, busca: string, page: number) =>
    ['membros', calendarioId, busca, page] as const,
  usuariosAdmin: ['usuariosAdmin'] as const,
  usuariosAdminPagina: (page: number) => ['usuariosAdmin', page] as const,
}
