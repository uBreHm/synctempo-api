# Plano de implementação: CRUDs básicos

## Fase atual - fundação de persistência

- [x] Criar a base Maven e o repositório Git local.
- [x] Documentar modelo, decisões e limites da entrega.
- [x] Criar migration PostgreSQL inicial e ambiente Docker local.
- [x] Mapear entidades e relações JPA.
- [x] Verificar compilação, testes de mapeamento e migration no Docker.

## Dependências

Migration PostgreSQL -> entidades JPA -> repositories/serviços/DTOs -> controllers.

## Fase 2 - segurança JWT

- [x] Configurar Spring Security, validação de entrada e autenticação stateless por JWT.
- [x] Implementar cadastro, login e consulta do usuário autenticado.
- [x] Manter chave JWT fora do repositório, validar assinatura, emissor, audiência e expiração.
- [x] Consultar usuário ativo e perfil global no banco em cada requisição autenticada.
- [x] Preparar autorização central por papel de membro do calendário.
- [x] Limitar tentativas de login no PostgreSQL e restringir CORS por origem.
- [ ] Integrar a autorização por calendário a cada serviço CRUD quando esses endpoints forem criados.
