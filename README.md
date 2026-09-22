# SyncTempo API

API REST para calendários individuais e colaborativos. Nesta primeira entrega, o projeto contém o modelo de persistência, as relações JPA, a migration Flyway e o ambiente PostgreSQL em Docker.

## Pré-requisitos

- Docker Desktop ou Docker Engine com Docker Compose.
- Java 21 apenas para executar fora do Docker.

## Executar pelo VS Code com Docker

1. Abra a pasta `synctempo-api` no VS Code.
2. Copie `.env.example` para `.env`.
3. No arquivo `.env`, informe uma senha local forte em `POSTGRES_PASSWORD`. Esse arquivo é ignorado pelo Git.
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

Configure as variáveis `DATABASE_URL`, `DATABASE_USERNAME` e `DATABASE_PASSWORD` no ambiente da IDE e execute `mvn test` ou `mvn spring-boot:run`. O Hibernate está em modo `validate`: somente as migrations criam ou alteram tabelas.

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
  model/       Entidades JPA
src/main/resources/db/migration
  V1__cria_usuario.sql
  V2__cria_calendario.sql
  V3__cria_membro_calendario.sql
  V4__cria_categoria.sql
  V5__cria_evento.sql
  V6__cria_evento_categoria.sql
docs/          Modelo, planejamento e decisões
```

## Modelo atual

- `Usuario` cria calendários e eventos.
- `Calendario` possui membros, categorias e eventos.
- `MembroCalendario` representa a participação e o papel no calendário.
- `Evento` e `Categoria` possuem relação muitos-para-muitos por `evento_categoria`.

Consulte [o modelo de domínio](docs/modelo-de-dominio.md) e [o planejamento](docs/planejamento-cruds-basicos.md) antes de expandir a API.

## Próximas etapas

DTOs e validações, repositories, serviços de regras de negócio, CRUDs HTTP, tratamento de erros e JWT serão adicionados em incrementos separados.
