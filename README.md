# SyncTempo API

API REST para calendários individuais e colaborativos. O projeto contém a fundação de persistência em PostgreSQL/Flyway e autenticação JWT para contas de usuário.

## Pré-requisitos

- Docker Desktop ou Docker Engine com Docker Compose.
- JDK 21 para compilar ou executar fora do Docker.

## Executar pelo VS Code com Docker

1. Abra a pasta `synctempo-api` no VS Code.
2. Copie `.env.example` para `.env`.
3. No arquivo `.env`, informe uma senha local forte em `POSTGRES_PASSWORD` e gere `JWT_SECRET_BASE64` com `openssl rand -base64 32`. Esse arquivo é ignorado pelo Git. A chave JWT deve ser diferente em cada ambiente.
4. Execute `docker compose up --build`.

A API estará em `http://localhost:8080` e o PostgreSQL em `localhost:5434` (porta interna 5432). Na primeira inicialização, o Flyway cria as tabelas. Os dados ficam no volume nomeado `synctempo-postgres-data`; use `docker compose down` para parar sem apagá-los.

## pgAdmin local

O pgAdmin é um serviço opcional, isolado em uma configuração Compose própria. A imagem `dpage/pgadmin4:8` é usada com volume persistente e não exige instalação fora do Docker.

1. Copie `.env.pgadmin.example` para `.env.pgadmin`.
2. Defina uma senha local forte em `PGADMIN_DEFAULT_PASSWORD` e mantenha o arquivo fora do Git.
3. Inicie o painel:

```bash
docker compose -f compose.yaml -f compose.pgadmin.yaml up -d pgadmin
```

Abra `http://localhost:5050` e use o e-mail configurado no arquivo local. Para cadastrar o servidor no pgAdmin, use `postgres` como host, `5432` como porta, `synctempo` como banco e usuário, e a mesma senha definida para o banco no `.env` principal.

### Contexto Docker nesta máquina

O daemon local disponível está no contexto `default`. Se `docker context show` indicar `desktop-linux` e aparecer erro de socket, execute:

```bash
docker --context default compose up --build -d
```

Essa opção não altera o contexto global nem remove volumes existentes.

## Desenvolvimento local

Configure as variáveis `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD` e `JWT_SECRET_BASE64` no ambiente da IDE e execute `mvn test` ou `mvn spring-boot:run`. O Hibernate está em modo `validate`: somente as migrations criam ou alteram tabelas. O valor JWT precisa conter ao menos 32 bytes após decodificação Base64.

## Autenticação

| Método e rota | Acesso | Corpo ou resultado |
| --- | --- | --- |
| `POST /auth/register` | Público | Recebe `name`, `email`, `password`; retorna `id`, `name`, `email` com HTTP 201. |
| `POST /auth/login` | Público | Recebe `email`, `password`; retorna `token`, `tokenType` e `expiresAt`. |
| `GET /auth/me` | Bearer JWT | Retorna os dados públicos do usuário autenticado. |

Use `Authorization: Bearer <token>` nas rotas protegidas. O token expira em 15 minutos por padrão; não há refresh token nesta etapa. O cadastro sempre cria uma conta comum ativa, e a senha é armazenada como hash BCrypt. Após 10 tentativas de login para o mesmo e-mail em 15 minutos, novas tentativas recebem HTTP 429 até a janela expirar. Uma autenticação bem-sucedida reinicia essa contagem.

Para um frontend em outra origem, configure `CORS_ALLOWED_ORIGINS` como uma lista de origens HTTP exatas separadas por vírgula. Sem essa variável, navegadores de outras origens não recebem permissão CORS. Veja [as decisões de segurança](docs/seguranca.md) para os limites do JWT e as regras de autorização por calendário.

## Documentação interativa

Com a aplicação em execução, abra [Swagger UI](http://localhost:8080/swagger-ui.html). A especificação OpenAPI está em [JSON](http://localhost:8080/v3/api-docs) e [YAML](http://localhost:8080/v3/api-docs.yaml). Essas rotas podem ser consultadas sem token; as operações protegidas continuam exigindo JWT. No Swagger UI, use **Authorize** com o token retornado por `POST /auth/login` para chamar essas operações.

`OPENAPI_ENABLED=true` habilita as duas rotas de documentação por padrão. Configure `OPENAPI_ENABLED=false` em ambientes onde a documentação não deve ser publicada. A integração segue a [documentação oficial do springdoc-openapi](https://springdoc.org/).

## CRUDs básicos

Todas as rotas abaixo exigem `Authorization: Bearer <token>`. As respostas de lista usam `data`, `page`, `size`, `totalItems` e `totalPages`; `page` começa em zero e `size` aceita 1 a 100.

| Método e rota | Regra |
| --- | --- |
| `GET /usuarios/me`, `PUT /usuarios/me` | Consultar ou substituir nome e e-mail da própria conta. |
| `PUT /usuarios/me/senha` | Trocar senha com `currentPassword` e `newPassword`. |
| `DELETE /usuarios/me` | Desativar a própria conta; bloqueado enquanto for ADMIN de um calendário. |
| `POST /calendarios` | Criar calendário e o membro ADMIN criador na mesma transação. |
| `GET /calendarios`, `GET /calendarios/{id}` | Listar calendários do usuário ou consultar um em que participa. |
| `PUT /calendarios/{id}`, `DELETE /calendarios/{id}` | Atualizar ou excluir calendário; exige ADMIN. |
| `GET /calendarios/{id}/categorias`, `GET /calendarios/{id}/categorias/{categoriaId}` | Consultar categorias; exige participação. |
| `POST /calendarios/{id}/categorias`, `PUT /calendarios/{id}/categorias/{categoriaId}`, `DELETE /calendarios/{id}/categorias/{categoriaId}` | Alterar categorias; exige ADMIN ou EDITOR. |

Calendários aceitam `nome`, `descricao` opcional e `cor` no formato `#RRGGBB`. Categorias aceitam `nome` e `cor`. As rotas `PUT` recebem o objeto completo. Respostas de erro usam `code` e `message` sem incluir detalhes internos.

## Especificações com OpenSpec

O projeto usa [OpenSpec](https://openspec.dev/) para registrar mudanças antes da implementação. A configuração fica em `openspec/` e as skills do Codex ficam em `.agents/skills/`; esses arquivos devem ser versionados junto com o código.

Fluxo recomendado no Codex:

1. `$openspec-explore "descreva a ideia ou problema"`
2. `$openspec-propose "descreva a mudança"` para gerar proposta, especificação, design e tarefas.
3. Revise os artefatos em `openspec/changes/`.
4. `$openspec-apply-change` para implementar uma mudança aprovada.
5. Valide com `openspec validate --changes --strict --no-interactive` e, ao concluir, `$openspec-archive-change`.

Validação da estrutura:

```bash
openspec validate --all --strict --no-interactive
```

O OpenSpec organiza o planejamento; testes Maven, migrations Flyway e verificações Docker continuam sendo necessários para provar a implementação.

## Estrutura

```text
src/main/java/br/com/synctempo/domain
  enums/       Enumerações persistidas como texto
  entity/      Entidades JPA
  repository/  Consultas de usuário e participação em calendário
src/main/java/br/com/synctempo/auth
  Cadastro e login; dto/request e dto/response
src/main/java/br/com/synctempo/calendario
  CRUD de calendários; dto/request e dto/response
src/main/java/br/com/synctempo/categoria
  CRUD de categorias; dto/request e dto/response
src/main/java/br/com/synctempo/usuario
  Operações da própria conta; dto/request e dto/response
src/main/java/br/com/synctempo/api
  Erros e configuração OpenAPI; dto/response para o erro público
src/main/java/br/com/synctempo/security
  config/         Configuração da cadeia Spring Security e do decoder JWT
  jwt/            Emissão de tokens e conversão do JWT autenticado
  user/           UserDetailsService e principal da conta
  authorization/  Autorização por papel de membro do calendário
  ratelimit/      Limite de tentativas de login
  handler/        Respostas HTTP de autenticação e autorização
src/main/resources/db/migration
  V1__cria_usuario.sql
  V2__cria_calendario.sql
  V3__cria_membro_calendario.sql
  V4__cria_categoria.sql
  V5__cria_evento.sql
  V6__cria_evento_categoria.sql
  V7__cria_tentativa_login.sql
docs/          Modelo, planejamento e decisões
```

Os testes de segurança espelham os pacotes de produção em `src/test/java/br/com/synctempo/security`.

Os DTOs ficam próximos da funcionalidade que define cada contrato HTTP. `UsuarioResponse` pertence a `usuario/dto/response` e é reutilizado pela autenticação. Entidades JPA permanecem em `domain/entity` e não são retornadas diretamente pela API. Veja [a decisão de organização dos pacotes](docs/decisions/0003-organizacao-de-entidades-e-dtos.md).

## Modelo atual

- `Usuario` cria calendários e eventos.
- `Calendario` possui membros, categorias e eventos.
- `MembroCalendario` representa a participação e o papel no calendário.
- `Evento` e `Categoria` possuem relação muitos-para-muitos por `evento_categoria`.

Consulte [o modelo de domínio](docs/modelo-de-dominio.md) e [o planejamento](docs/planejamento-cruds-basicos.md) antes de expandir a API.

## Próximas etapas

Os próximos incrementos criam os serviços de membros e eventos. O membro ADMIN criador já é criado automaticamente; a troca de administradores e a regra de categorias do mesmo calendário para eventos dependem desses serviços.
