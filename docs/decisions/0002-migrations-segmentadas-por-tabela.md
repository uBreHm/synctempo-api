# ADR-0002: Segmentar migrations por tabela

## Status

Aceita

## Data

2026-09-23

## Contexto

A primeira migration agrupava todo o esquema em `V1__cria_modelo_inicial.sql`. Para facilitar revisão, evolução e identificação de falhas, cada tabela deve ter uma migration Flyway própria.

Durante esta alteração, a migration monolítica já existia apenas no volume local do projeto e todas as tabelas estavam vazias. O histórico local foi recriado para aplicar a sequência segmentada desde o início.

## Decisão

Usar a sequência `V1__cria_usuario.sql` até `V6__cria_evento_categoria.sql`, ordenada pelas dependências entre as tabelas. Índices pertencentes a cada tabela ficam no mesmo arquivo da tabela.

## Consequências

- Cada migration tem escopo pequeno e pode ser revisada isoladamente.
- O banco novo aplica as dependências na ordem correta e o Hibernate continua apenas validando o esquema.
- A recriação do volume foi uma exceção segura para este ambiente local vazio; em ambientes compartilhados, migrations aplicadas nunca devem ser editadas ou renumeradas. Nesse caso, a mudança deve ser feita com novas migrations incrementais.
