import type { PapelCalendario, PerfilGlobal, Visibilidade } from '../types/enums'

export const PAPEIS: PapelCalendario[] = ['ADMIN', 'EDITOR', 'LEITOR']

export const ROTULO_PAPEL: Record<PapelCalendario, string> = {
  ADMIN: 'Administrador',
  EDITOR: 'Editor',
  LEITOR: 'Leitor',
}

export const ROTULO_VISIBILIDADE: Record<Visibilidade, string> = {
  DETALHADA: 'Mostrar detalhes',
  SOMENTE_OCUPADO: 'Mostrar só como ocupado',
}

export const ROTULO_PERFIL: Record<PerfilGlobal, string> = {
  USUARIO: 'Usuário',
  ADMIN_SISTEMA: 'Administrador do sistema',
}

// Espelham as regras de autorização da API. Servem só para mostrar ou esconder ações;
// a API decide e um 403 é exibido normalmente.

/** Criar, editar e excluir eventos e categorias. */
export function podeEditar(papel: PapelCalendario | undefined): boolean {
  return papel === 'ADMIN' || papel === 'EDITOR'
}

/** Alterar ou excluir o calendário e administrar membros. */
export function podeAdministrar(papel: PapelCalendario | undefined): boolean {
  return papel === 'ADMIN'
}
