# ADR-0001: Modelagem relacional inicial com PostgreSQL e Flyway

## Status

Aceita

## Data

2026-09-22

## Contexto

O sistema possui dados relacionais, autorização por participação no calendário e precisa manter histórico de evolução do esquema. A entrega atual exige entidades, relacionamentos e migrations.

## Decisão

Usar PostgreSQL como banco principal, Flyway para uma migration inicial imutável e JPA/Hibernate apenas para validar o esquema em execução. Os papéis globais, de membro e a visibilidade são armazenados como texto controlado por enums Java.

## Consequências

- O banco aplica unicidade, referências e as regras temporais verificáveis sem contexto de autenticação.
- Novas mudanças de banco exigem uma nova migration versionada; a migration inicial não deve ser alterada após ser aplicada em qualquer ambiente compartilhado.
- Regras que dependem do usuário autenticado permanecem na futura camada de serviço, dentro de transações.
