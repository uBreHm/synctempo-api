# Segurança JWT

## Fronteiras e dados protegidos

As requisições HTTP são entrada não confiável. A conta armazena nome, e-mail normalizado, hash da senha, perfil global e estado ativo. DTOs públicos nunca incluem `senhaHash`; a entidade JPA não é serializada diretamente. Os papéis `ADMIN`, `EDITOR` e `LEITOR` pertencem a cada calendário, não à conta global.

O código de segurança está dividido por responsabilidade: `config` monta Spring Security e JWT; `jwt` emite e converte tokens; `user` adapta a conta a `UserDetails`; `authorization` verifica o papel no calendário; `ratelimit` controla tentativas de login; `handler` padroniza respostas HTTP 401/403.

## Autenticação implementada

- `POST /auth/register` valida nome, e-mail e senha, cria sempre `USUARIO` ativo e guarda hash BCrypt com fator de trabalho 12. A senha aceita 12 a 72 caracteres e até 72 bytes UTF-8.
- `POST /auth/login` autentica por e-mail e senha e devolve um JWT assinado com HS256. Falhas de credencial retornam HTTP 401 sem distinguir e-mail inexistente, senha errada ou conta inativa.
- O segredo de assinatura é obrigatório, vem de `JWT_SECRET_BASE64` e deve representar pelo menos 32 bytes. O valor local fica no `.env` ignorado; em produção deve vir do gerenciador de segredos. O mesmo segredo é necessário em todas as instâncias. Sua troca invalida os JWTs anteriores.
- O JWT contém apenas `sub` (ID do usuário), `iss`, `aud`, `iat`, `exp` e `jti`. O prazo padrão é 15 minutos, configurável por `JWT_ACCESS_TOKEN_TTL` até o máximo de duas horas. O decoder valida assinatura, algoritmo HS256, emissor, audiência e tempo.
- Em cada requisição com JWT, a API consulta o usuário por ID no banco e rejeita imediatamente contas removidas ou inativas. O perfil global também é lido do banco, evitando autorização com papel antigo no token.
- Spring Security processa o header `Authorization: Bearer`. Não há filtro JWT próprio, sessão HTTP ou login por formulário. Cadastro e login são as rotas de negócio públicas; as demais exigem autenticação.
- Swagger UI e OpenAPI também são acessíveis sem token quando `OPENAPI_ENABLED=true`; a documentação declara o esquema Bearer JWT, mas não altera as regras de acesso dos endpoints de negócio. Desative a documentação com `OPENAPI_ENABLED=false` quando não quiser publicá-la.

## Autorização e abuso

- `CalendarioAuthorizationService` consulta `MembroCalendario` para exigir leitura (`ADMIN`, `EDITOR`, `LEITOR`), edição (`ADMIN`, `EDITOR`) ou administração (`ADMIN`). `ADMIN_SISTEMA` não ignora a exigência de participação. Os CRUDs de calendário e categoria chamam esse serviço na mesma transação da ação de negócio; membros e eventos deverão seguir o mesmo padrão.
- O banco conta atomicamente até 10 tentativas de login por e-mail normalizado em uma janela de 15 minutos, compartilhada entre instâncias. O identificador é um HMAC do e-mail, não o e-mail em texto. A 11ª tentativa retorna HTTP 429; sucesso limpa a contagem. Registros antigos são removidos a cada hora. Em produção, uma limitação adicional por origem no gateway ajuda contra ataques que distribuem tentativas por muitos e-mails.
- CORS aceita somente as origens HTTP explícitas em `CORS_ALLOWED_ORIGINS`. Sem configuração, não há acesso entre origens no navegador. CSRF está desabilitado para o fluxo atual, que usa Bearer no header e não usa cookies de sessão.

## Limites atuais

Não há refresh token, endpoint de logout ou revogação de JWT por `jti`. A desativação da conta bloqueia o token imediatamente por causa da consulta ao banco; outras formas de encerramento da sessão dependem da expiração ou da troca da chave. A desativação é recusada enquanto o usuário possui papel ADMIN em algum calendário. A criação do calendário já cria o membro ADMIN na mesma transação. A transferência de administração e a validação de categorias do mesmo calendário ficam para os serviços de membros e eventos.
