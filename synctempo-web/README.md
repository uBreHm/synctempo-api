# SyncTempo Web

Interface web da [SyncTempo API](../README.md), em Vite, React e TypeScript strict. O front só consome a API: não há regra de negócio própria, e a mensagem que a API devolve é sempre exibida.

## Requisitos

- Node.js 20 ou mais recente (testado com 22).
- SyncTempo API rodando e liberando a origem do front em CORS.

## Como rodar

1. Suba a API conforme o README dela. No `.env` da API, libere a origem do front e reinicie a API:

   ```
   CORS_ALLOWED_ORIGINS=http://localhost:5173
   ```

   Sem isso o navegador bloqueia as requisições e o front mostra "Verifique sua conexão e tente novamente." em todas as telas.

2. Configure e inicie o front:

   ```bash
   cp .env.example .env
   npm install
   npm run dev
   ```

3. Abra http://localhost:5173, crie uma conta e entre.

### Variáveis de ambiente

| Variável | Padrão | Uso |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `http://localhost:8080` | Endereço da API, sem barra final e sem prefixo de rota. |

### Scripts

| Comando | Faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento na porta 5173. |
| `npm run build` | Checagem de tipos (`tsc -b`) e build de produção em `dist/`. |
| `npm run lint` | ESLint. |
| `npm test` | Testes de `utils/` e `api/` com Vitest. |
| `npm run preview` | Serve o build de produção. |

## Telas e endpoints

| Tela | Rota | Endpoints |
| --- | --- | --- |
| Entrar | `/entrar` | `POST /auth/login`, `GET /auth/me` |
| Criar conta | `/cadastro` | `POST /auth/register` |
| Agenda (dia e semana) | `/?data=AAAA-MM-DD&visao=semana` | `GET /usuarios/me/calendarios`, `GET /calendarios/{id}/eventos` (todas as páginas, por calendário visível) |
| Detalhe do evento | diálogo na agenda | `GET` e `DELETE /calendarios/{id}/eventos/{eventoId}` |
| Novo ou editar evento | diálogo na agenda | `GET /calendarios/{id}/categorias`, `POST /calendarios/{id}/eventos`, `PUT /calendarios/{id}/eventos/{eventoId}` |
| Criar calendário | `/calendarios/novo` | `POST /calendarios` |
| Configurar calendário | `/calendarios/{id}` | `GET`/`PUT`/`DELETE /calendarios/{id}`; CRUD de `/calendarios/{id}/categorias`; `GET`/`POST /calendarios/{id}/membros`, `PUT`/`DELETE /calendarios/{id}/membros/{membroId}` |
| Minha conta | `/conta` | `GET`/`PUT`/`DELETE /usuarios/me`, `PUT /usuarios/me/senha` |
| Contas do sistema | `/admin` | `GET /admin/usuarios`, `PATCH /admin/usuarios/{id}/ativar` |

A tela `/admin` não aparece no menu, porque a API não informa se a conta é `ADMIN_SISTEMA` (veja as pendências). Contas sem esse perfil recebem a mensagem de acesso negado da API.

## Estrutura

```text
src/
  api/         client HTTP (fetch, Bearer, erros), sessão, paginação e um arquivo por recurso
  types/       tipos espelhando os DTOs da API, com os mesmos nomes de campos
  hooks/       consultas e mutações do TanStack Query por recurso
  components/  comum/ (botão, campo, diálogo, estados), layout/, agenda/, eventos/, calendarios/, sessao/
  pages/       uma tela por rota
  utils/       datas, posição de eventos sobrepostos, validação, mensagens de erro e rótulos
  styles/      tokens (cores, tipografia, espaçamento) e estilos globais
```

## Decisões

- **Datas**: `dataEvento`, `horaInicio` e `horaFim` não têm fuso na API e são exibidos exatamente como vieram, sem conversão.
- **Sessão**: o token fica no `sessionStorage` até o `expiresAt` do login. Um 401 de qualquer rota protegida encerra a sessão e leva para "Entrar" com o aviso de sessão expirada.
- **Calendários ocultos**: a escolha de quais calendários aparecem na agenda fica no `localStorage` deste navegador e não vai para a API.
- **Permissões**: o papel em cada calendário (de `GET /usuarios/me/calendarios`) só decide quais botões aparecem. A API continua decidindo, e um 403 é exibido normalmente.
- **Validação**: os formulários repetem as anotações dos DTOs (obrigatoriedade, tamanhos, `#RRGGBB`, `https?://`, e-mail, senha de 12 a 72 caracteres e até 72 bytes, regra de horário) para avisar antes do envio.
- **Termos**: a interface usa sempre "evento" e "calendário". "Agenda" é só o nome da tela principal.

## Pendências da API

Pontos encontrados durante a integração. Nenhum foi contornado com lógica no front que substitua o back. A coluna "No front" diz o que a interface faz hoje.

| # | Pendência | Efeito | No front |
| --- | --- | --- | --- |
| 1 | `GET /calendarios/{id}/eventos` não filtra por período (ex.: `de`/`ate`). | Para montar uma semana é preciso baixar todos os eventos do calendário, 100 por página. O custo cresce com o histórico. | Percorre todas as páginas e desenha só os eventos da semana ou do dia exibido. |
| 2 | Não existe listagem de eventos de todos os calendários da conta. | Uma sequência de requisições por calendário visível. | Uma consulta por calendário; se uma falhar, as outras continuam aparecendo. |
| 3 | `UsuarioResponse` (`/auth/me`) e o JWT não trazem o `perfil`. | O front não sabe se a conta é `ADMIN_SISTEMA`. | `/admin` só por URL, sem link no menu. |
| 4 | Erros de validação voltam só `"Dados invalidos"`, sem campo nem motivo. | Não dá para apontar o campo recusado pela API. | Valida no front as mesmas regras dos DTOs e mostra a mensagem da API quando ela recusa. |
| 5 | Mensagens de erro sem acentuação (`"Calendario inexistente"`). | Destoam da interface em pt-BR. | Exibidas sem alteração. |
| 6 | Token de 15 minutos sem refresh token. | A sessão cai no meio do uso e o que estava sendo digitado se perde. | Leva para "Entrar" com aviso e volta para a mesma tela depois do login. |
| 7 | `PUT /usuarios/me/senha` responde 401 quando a senha atual está errada. | Mesmo status de token expirado; não dá para separar os dois casos só pelo status. | Essa rota é a única em que um 401 não encerra a sessão. Sugestão: responder 400 ou 422. |
| 8 | Um Editor pode fazer `PUT` em evento `SOMENTE_OCUPADO` de outra pessoa, mas recebe esse evento como `"Ocupado"` com campos nulos. | Como o `PUT` exige o objeto completo, salvar gravaria "Ocupado" e campos vazios por cima dos dados reais. | "Editar evento" não aparece nesses casos ("Excluir evento" continua). Sugestão: limitar a edição ao criador ou entregar os dados a quem pode editar. |
| 9 | `EventoRequest` não tem `calendarioId`. | Não dá para mover um evento para outro calendário. | O calendário aparece fixo na edição. |
| 10 | Um membro não consegue sair de um calendário: `DELETE .../membros/{id}` exige ADMIN. | Leitores e editores dependem de um administrador para sair. | Sem opção de sair. |
| 11 | Nomes misturados: `name` em auth/usuário e `nome` nos demais DTOs. | Contrato inconsistente. | Tipos espelham os nomes como estão. |
| 12 | Evento só de um dia e datas/horas sem fuso (`LocalDate`, `LocalTime`, `LocalDateTime` em `entrouEm`). | Sem eventos de vários dias; membros em fusos diferentes veem o mesmo horário literal. | Exibe as datas e horas como vieram. |
| 13 | O 429 do login não traz `Retry-After`. | O front não sabe quanto tempo pedir para esperar. | Pede para aguardar alguns minutos. |
