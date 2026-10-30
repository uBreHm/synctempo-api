// Regras espelhadas das anotações de validação dos DTOs da API (Bean Validation).
// A API continua sendo a fonte da verdade: a mensagem que ela devolver é sempre exibida.

/** @Pattern(regexp = "#[0-9A-Fa-f]{6}") */
export const REGEX_COR = /^#[0-9A-Fa-f]{6}$/

/** @Pattern(regexp = "https?://\\S+") */
export const REGEX_LINK = /^https?:\/\/\S+$/

/** Aproximação do @Email do Hibernate Validator: texto@domínio, sem espaços. */
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+$/

export type Erros<Campo extends string> = Partial<Record<Campo, string>>

export function semErros(erros: Record<string, string | undefined>): boolean {
  return Object.values(erros).every((erro) => erro === undefined)
}

/** @NotBlank */
export function exigir(valor: string, mensagem: string): string | undefined {
  return valor.trim() === '' ? mensagem : undefined
}

/** @Size(max) */
export function limitar(valor: string, maximo: number): string | undefined {
  return valor.length > maximo ? `Use no máximo ${maximo} caracteres.` : undefined
}

/** @NotBlank @Size(max) */
export function exigirTexto(valor: string, mensagem: string, maximo: number): string | undefined {
  return exigir(valor, mensagem) ?? limitar(valor.trim(), maximo)
}

/** @NotBlank @Email @Size(max = 320) */
export function validarEmail(valor: string): string | undefined {
  const email = valor.trim()
  if (email === '') return 'Informe o e-mail.'
  if (!REGEX_EMAIL.test(email)) return 'Informe um e-mail válido, como nome@exemplo.com.'
  return limitar(email, 320)
}

/** @NotBlank @Size(min = 12, max = 72) + limite de 72 bytes UTF-8 verificado no serviço. */
export function validarNovaSenha(valor: string): string | undefined {
  if (valor.trim() === '') return 'Informe a senha.'
  if (valor.length < 12 || valor.length > 72) return 'Use uma senha de 12 a 72 caracteres.'
  if (new TextEncoder().encode(valor).length > 72) {
    return 'A senha passa do limite de 72 bytes. Use menos caracteres acentuados ou símbolos.'
  }
  return undefined
}

/** @NotBlank @Pattern(#RRGGBB) */
export function validarCor(valor: string): string | undefined {
  return REGEX_COR.test(valor) ? undefined : 'Escolha uma cor no formato #RRGGBB.'
}

/** Campo opcional: texto sem espaços nas pontas, ou null quando vazio. */
export function textoOuNulo(valor: string): string | null {
  const texto = valor.trim()
  return texto === '' ? null : texto
}
