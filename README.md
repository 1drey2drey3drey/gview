# Gview

Plataforma web de demos de jogos indie jogáveis no navegador.  
Inspirada no Spawnd e no itch.io — sem instalação, só jogar.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Front-end | React + Vite (JavaScript) |
| Back-end | Node.js + Express |
| Banco | PostgreSQL + Prisma ORM |
| API externa | RAWG Video Games Database API |
| Testes | Vitest + Supertest + Playwright |

## Instalação e execução

### Pré-requisitos
- Node.js 18+
- PostgreSQL rodando localmente

### Backend

```bash
cd backend
cp .env.example .env        # preencha DATABASE_URL, JWT_SECRET e RAWG_API_KEY
npm install
npx prisma migrate dev      # cria as tabelas
npm run db:seed             # popula com dados de exemplo
npm run dev                 # http://localhost:3001
```

### Frontend

```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

## Rotas da API

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /api/health | Status da API |
| GET | /api/games | Lista todos os jogos |
| GET | /api/games?status=FEATURED | Jogos em destaque |
| GET | /api/games?status=COMING_SOON | Em breve |
| GET | /api/games/:slug | Detalhe do jogo |
| POST | /api/submissions | Enviar submissão de jogo |
| GET | /api/submissions | Listar submissões (admin) |
| PATCH | /api/submissions/:id/status | Aprovar / rejeitar submissão |
| POST | /api/auth/register | Cadastro de usuário |
| POST | /api/auth/login | Login |
| GET | /api/wishlist/:userId | Lista de desejos |
| GET | /api/rawg/search?q= | Busca na RAWG API |
| GET | /api/rawg/game/:rawgId | Detalhes de jogo na RAWG API |

## Telas

| Tela | Rota | Operações |
|------|------|-----------|
| Home | / | Leitura de jogos (via API com fallback para mock) |
| Detalhe do jogo | /game/:slug | Leitura + wishlist |
| Jogar demo | /play/:slug | Execução via iframe |
| Enviar jogo | /submit | Criação de submissão |
| Painel admin | /admin | Leitura e atualização de submissões |

## Documentação

| Documento | Arquivo |
|---|---|
| Casos de uso (UC01–UC15) | [`docs/casos-de-uso.md`](docs/casos-de-uso.md) |
| Modelagem do banco de dados | [`docs/modelagem.md`](docs/modelagem.md) |
| Integração com API externa (RAWG) | [`docs/api-externa.md`](docs/api-externa.md) |
| Escopo e planejamento da Sprint 1 | [`SPRINT1.md`](SPRINT1.md) |

## Repositório

O código-fonte versionado está disponível no repositório GitHub do grupo.  
Para clonar e executar, siga as instruções de instalação acima.
