# ADR-0003: Organizar entidades e DTOs por responsabilidade

## Status

Aceita

## Data

2026-10-06

## Contexto

O projeto cresceu além das entidades JPA iniciais. Os DTOs de autenticação, usuário, calendário e categoria estavam misturados com controllers e serviços, e as entidades ficavam em `domain/model`. Os próximos recursos, membros e eventos, precisam de uma convenção que mantenha visíveis os contratos HTTP e a fronteira de persistência.

## Decisão

- Manter cada funcionalidade em seu pacote (`auth`, `usuario`, `calendario`, `categoria`) e colocar seus DTOs em `dto/request` e `dto/response` dentro dele.
- Colocar as entidades JPA em `domain/entity`; manter enums e repositories nos pacotes `domain/enums` e `domain/repository`.
- Manter `UsuarioResponse` em `usuario/dto/response`, pois representa a conta e é usado tanto por usuário quanto por autenticação. O erro HTTP comum fica em `api/dto/response`.
- Controllers recebem requests e retornam responses. Entidades não são serializadas diretamente nem contêm contratos HTTP.

## Alternativas consideradas

Um único `dto/request` e `dto/response` na raiz reduziria a profundidade dos pacotes, mas reuniria contratos de funcionalidades distintas. Manter todos os DTOs diretamente ao lado dos serviços evitaria pastas adicionais, mas dificultaria localizar a fronteira HTTP conforme o projeto crescer.

## Consequências

- Novos recursos devem seguir o mesmo formato de pacotes sem criar um catálogo global de DTOs.
- A mudança altera nomes de pacotes Java e imports, mas preserva nomes de classes, rotas, campos JSON, tabelas e migrations.
- A especificação OpenAPI continua derivada dos DTOs públicos; hashes de senha e relações JPA não entram nas respostas.
