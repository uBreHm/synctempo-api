# Planejamento - CRUDs básicos

## Escopo desta etapa

Esta entrega prepara a persistência do SyncTempo, uma API para calendários pessoais e colaborativos. Ela cobre entidades, relacionamentos e versionamento do banco. Endpoints, DTOs, JWT, serviços de autorização e interface ficam para as próximas etapas do cronograma.

## Ordem de implementação

1. Criar o projeto Maven, Docker Compose e a configuração segura de PostgreSQL/Flyway.
2. Criar uma migration Flyway por tabela, respeitando a ordem das dependências.
3. Mapear as entidades JPA e os enums do domínio.
4. Verificar a compilação, os testes de mapeamento e a validação da migration pelo Flyway em PostgreSQL.

## Critérios de aceite

- Existem Usuario, Calendario, MembroCalendario, Categoria e Evento.
- Calendario - MembroCalendario e Calendario - Evento são 1:N; Evento - Categoria é N:N.
- As regras estruturais estão protegidas por chaves, unicidades e checks na migration.
- O Hibernate apenas valida o esquema; ele não o cria.
- Não há senha, URL de produção ou outra credencial gravada no repositório.

## Fora de escopo nesta etapa

- CRUD HTTP, DTOs, autenticação JWT e regras de permissão em serviço.
- Participantes e lembretes de eventos: citados como evolução do produto, mas não constam no DER fornecido.

## Próximo corte sugerido

Criar os CRUDs de Usuario, Calendario e Categoria com DTOs, validação e tratamento centralizado de erros. Em seguida, adicionar membros e eventos com a autorização por papel no calendário.
