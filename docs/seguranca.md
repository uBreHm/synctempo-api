# Segurança - estado da fundação

## Ativos e limites de confiança

Os dados pessoais atuais são nome e e-mail; a senha nunca deve sair do processo de autenticação em texto puro. Requisições HTTP, quando os controllers forem criados, serão a fronteira de entrada não confiável.

## Controles já adotados

- A entidade usa o campo `senhaHash`, mapeado para a coluna `senha`; nenhum valor padrão de senha é versionado.
- O Compose exige `POSTGRES_PASSWORD` no arquivo local `.env`, que é ignorado pelo Git.
- E-mail tem unicidade e normalização em minúsculas no domínio e no banco.
- JPA será usado com repositories parametrizados; não haverá SQL montado por concatenação de entrada do usuário.

## Obrigatório antes de expor endpoints

- DTOs com validação no controller; entidades nunca serão serializadas diretamente.
- BCrypt com fator de trabalho adequado para cadastro e troca de senha.
- JWT com expiração de duas horas, filtro de autenticação e autorização por papel do calendário no serviço central.
- Respostas de erro sem detalhes internos, CORS restrito e limitação de tentativas de login.
- Verificação de que `senhaHash` jamais aparece em DTO, log ou resposta HTTP.
