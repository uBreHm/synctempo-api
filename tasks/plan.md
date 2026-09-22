# Plano de implementação: CRUDs básicos

## Fase atual - fundação de persistência

- [x] Criar a base Maven e o repositório Git local.
- [x] Documentar modelo, decisões e limites da entrega.
- [x] Criar migration PostgreSQL inicial e ambiente Docker local.
- [x] Mapear entidades e relações JPA.
- [x] Verificar compilação, testes de mapeamento e migration no Docker.

## Dependências

Migration PostgreSQL -> entidades JPA -> repositories/serviços/DTOs -> controllers.
