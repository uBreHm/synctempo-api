# Modelo de domínio

## Entidades

| Entidade | Responsabilidade | Relacionamentos |
| --- | --- | --- |
| Usuario | Conta global da plataforma | Cria calendários e eventos; participa de calendários |
| Calendario | Espaço individual ou colaborativo | Pertence ao criador; possui membros, categorias e eventos |
| MembroCalendario | Participação de um usuário em um calendário | Mantém o papel ADMIN, EDITOR ou LEITOR |
| Categoria | Classificação local de um calendário | Pode classificar vários eventos do mesmo calendário |
| Evento | Compromisso em um único dia | Pertence a calendário e criador; recebe categorias |

## Regras representadas no banco

- E-mail de usuário é único e sempre armazenado em minúsculas.
- Um usuário só pode ter uma participação por calendário.
- Nome de categoria é único por calendário.
- A associação evento-categoria impede pares duplicados.
- Um evento de dia inteiro não possui horários; nos demais, o fim deve ser posterior ao início.
- A remoção de um calendário apaga membros, categorias, eventos e suas associações.

## Regras que dependem da camada de serviço

- Criador do calendário torna-se ADMIN automaticamente.
- Sempre deve restar ao menos um ADMIN em cada calendário.
- Somente membros podem acessar dados do calendário e somente ADMIN/EDITOR criam eventos.
- Categorias associadas a um evento precisam pertencer ao mesmo calendário.

Essas regras exigem contexto do usuário autenticado e transação de negócio; serão implementadas junto dos serviços e da segurança.
