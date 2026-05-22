# Gview

Plataforma web de demos de jogos jogáveis no navegador. Usuários navegam pelo catálogo e iniciam partidas diretamente no browser via WebGL/HTML5. Desenvolvedores submetem seus jogos por meio de formulário próprio.

## Stack

| Camada | Tecnologia |
|---|---|
| Front-end | React + Vite (JavaScript) |
| Back-end | Node.js + Express |
| Banco de dados | PostgreSQL + Prisma ORM |
| API externa | RAWG Video Games Database API |

**Arquitetura:** monolito modular com API REST. `frontend/` e `backend/` são aplicações separadas que se comunicam via HTTP. A RAWG API é consumida pelo back-end para não expor a chave no navegador.

## API Externa

**RAWG Video Games Database API** — `https://rawg.io/apidocs`.

Justificativa: API pública com cobertura ampla de jogos, suporte a gêneros, plataformas, imagens e metadados variados. A integração é diretamente aderente ao domínio do Gview porque permite enriquecer o catálogo com dados reais sem esforço de curadoria manual, além de ser simples de consumir e gratuita para uso acadêmico.

### Justificativa das escolhas tecnológicas

**React + Vite (JavaScript)** — entrega rápida, componentização forte, ecossistema amplo e ótima integração com formulários e roteamento. Vite reduz a complexidade inicial e acelera o setup da Sprint 1.

**Node.js + Express** — simplicidade, curva baixa para CRUD e integração fácil com front-end JavaScript. Escolha coerente com o prazo curto e com a necessidade de demonstrar uma API REST de forma clara.

**PostgreSQL + Prisma ORM** — modelagem relacional adequada ao domínio, suporte robusto a consultas e facilidade para migração e seed. O Prisma documenta o modelo de dados e já prepara a persistência para as sprints seguintes.

**RAWG API** — aderência direta ao domínio, uso simples para enriquecer metadados, capas e gêneros. A integração apoia a experiência do catálogo sem exigir curadoria manual de dados.



## Casos de uso

### UC01 — Visualizar demos em destaque
- **Ator:** visitante.
- **Pré-condição:** jogos marcados como destaque existem no sistema.
- **Fluxo principal:** visitante acessa a home; sistema exibe seção de destaques.
- **Fluxo alternativo:** nenhum jogo em destaque; sistema mostra estado vazio.
- **Pós-condição:** visitante identifica demos prioritárias.

### UC02 — Visualizar todas as demos
- **Ator:** visitante.
- **Pré-condição:** catálogo disponível.
- **Fluxo principal:** visitante acessa a listagem geral; sistema exibe todas as demos disponíveis.
- **Fluxo alternativo:** catálogo vazio.
- **Pós-condição:** usuário consulta o acervo.

### UC03 — Visualizar demos em breve
- **Ator:** visitante.
- **Pré-condição:** jogos com status `COMING_SOON` existem.
- **Fluxo principal:** visitante acessa a seção; sistema lista futuras demos.
- **Fluxo alternativo:** nenhuma demo futura cadastrada.
- **Pós-condição:** visitante visualiza próximos lançamentos.

### UC04 — Ver detalhes de um jogo
- **Ator:** visitante.
- **Pré-condição:** jogo cadastrado.
- **Fluxo principal:** visitante seleciona um card; sistema abre página de detalhes.
- **Fluxo alternativo:** jogo indisponível ou removido.
- **Pós-condição:** visitante lê informações completas.

### UC05 — Jogar uma demo
- **Ator:** visitante ou usuário autenticado.
- **Pré-condição:** jogo possui `demoUrl` válida.
- **Fluxo principal:** usuário clica em "Jogar"; sistema carrega a página da demo.
- **Fluxo alternativo:** demo indisponível; sistema informa erro.
- **Pós-condição:** demo é iniciada.

### UC06 — Cadastrar conta
- **Ator:** visitante.
- **Pré-condição:** e-mail não cadastrado.
- **Fluxo principal:** visitante preenche formulário; sistema cria conta.
- **Fluxo alternativo:** e-mail já utilizado ou dados inválidos.
- **Pós-condição:** conta registrada.

### UC07 — Realizar login
- **Ator:** usuário cadastrado.
- **Pré-condição:** conta ativa.
- **Fluxo principal:** usuário informa credenciais; sistema autentica acesso.
- **Fluxo alternativo:** credenciais inválidas.
- **Pós-condição:** sessão autenticada.

### UC08 — Adicionar jogo à wishlist
- **Ator:** usuário autenticado.
- **Pré-condição:** usuário logado; jogo existente.
- **Fluxo principal:** usuário aciona botão de lista; sistema grava vínculo.
- **Fluxo alternativo:** item já existe na lista.
- **Pós-condição:** wishlist atualizada.

### UC09 — Remover jogo da wishlist
- **Ator:** usuário autenticado.
- **Pré-condição:** item presente na wishlist.
- **Fluxo principal:** usuário remove o item; sistema atualiza lista.
- **Fluxo alternativo:** item não encontrado.
- **Pós-condição:** wishlist atualizada.

### UC10 — Visualizar wishlist
- **Ator:** usuário autenticado.
- **Pré-condição:** usuário logado.
- **Fluxo principal:** sistema exibe lista pessoal do usuário.
- **Fluxo alternativo:** wishlist vazia.
- **Pós-condição:** usuário acompanha jogos salvos.

### UC11 — Avaliar uma demo
- **Ator:** usuário autenticado.
- **Pré-condição:** jogo disponível; usuário autenticado.
- **Fluxo principal:** usuário envia nota e comentário; sistema persiste avaliação.
- **Fluxo alternativo:** dados inválidos ou avaliação duplicada.
- **Pós-condição:** avaliação registrada.

### UC12 — Enviar submissão de jogo
- **Ator:** desenvolvedor.
- **Pré-condição:** formulário acessível.
- **Fluxo principal:** desenvolvedor preenche dados e envia submissão.
- **Fluxo alternativo:** campos obrigatórios ausentes.
- **Pós-condição:** submissão registrada como pendente.

### UC13 — Consultar submissões recebidas
- **Ator:** administrador.
- **Pré-condição:** admin autenticado.
- **Fluxo principal:** admin acessa painel e lista submissões.
- **Fluxo alternativo:** sem submissões cadastradas.
- **Pós-condição:** admin visualiza fila de análise.

### UC14 — Aprovar ou rejeitar submissão
- **Ator:** administrador.
- **Pré-condição:** submissão existente e pendente.
- **Fluxo principal:** admin revisa e altera status.
- **Fluxo alternativo:** submissão já tratada.
- **Pós-condição:** estado final atualizado.

### UC15 — Editar dados de um jogo cadastrado
- **Ator:** administrador.
- **Pré-condição:** jogo existente.
- **Fluxo principal:** admin altera dados; sistema salva edição.
- **Fluxo alternativo:** dados inválidos.
- **Pós-condição:** jogo atualizado no catálogo.

## Modelagem Inicial do Banco de Dados

### Entidades principais

#### User
- id
- name
- email
- passwordHash
- role (`PLAYER`, `DEVELOPER`, `ADMIN`)
- createdAt
- updatedAt

#### Game
- id
- title
- slug
- shortDescription
- fullDescription
- coverUrl
- trailerUrl
- demoUrl
- status (`FEATURED`, `AVAILABLE`, `COMING_SOON`)
- genre
- studioName
- launchWindow
- createdAt
- updatedAt

#### Submission
- id
- gameTitle
- projectUrl
- description
- launchPlans
- targetPlatforms
- launchDateRange
- demoLink
- nextFestParticipation
- heardAbout
- additionalInfo
- contactRole
- contactEmail
- studioName
- attachmentUrl
- reviewStatus (`PENDING`, `APPROVED`, `REJECTED`)
- createdAt
- updatedAt

#### Wishlist
- id
- userId
- gameId
- createdAt

#### Review
- id
- userId
- gameId
- rating
- comment
- createdAt
- updatedAt