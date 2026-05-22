# Casos de Teste (Sprint 2)

## CT01 - Criação de Game Jam
- **Objetivo**: Verificar se a API cria um Game Jam com sucesso.
- **Pré-condição**: Servidor rodando, payload JSON válido.
- **Ação**: POST /api/gamejams
- **Resultado Esperado**: Retorna status 201 e o objeto criado.

## CT02 - Importação da RAWG (Mock e Real)
- **Objetivo**: Garantir que o endpoint de importação salva o jogo com dados mockados na ausência da chave, ou com dados da API real quando configurada.
- **Pré-condição**: Servidor rodando.
- **Ação**: POST /api/rawg/import/123 (requer autenticação de administrador).
- **Resultado Esperado**: Retorna 201 e o objeto criado. O slug deve ser gerado unicamente e não permitir importações duplicadas.

## CT03 - Slugify Utility
- **Objetivo**: Verificar se a função utilitária converte strings complexas em slugs URL-friendly.
- **Ação**: Chamar `slugify('Hollow Knight: Silksong')`
- **Resultado Esperado**: O retorno deve ser `'hollow-knight-silksong'`.

## CT04 - Autenticação e Fluxo de Usuários (CRUD de Conta)
- **Objetivo**: Verificar fluxos de registro, login, leitura de dados (me), edição de nome e deleção de conta.
- **Ações**: 
  - POST `/api/auth/register` (Registrar novo usuário).
  - POST `/api/auth/login` (Login de usuário).
  - GET `/api/auth/me` (Obter dados do perfil).
  - PUT `/api/auth/me` (Atualizar nome do perfil).
  - DELETE `/api/auth/me` (Remover conta permanentemente).
- **Resultado Esperado**: Todas as operações devem retornar status HTTP correspondentes (200, 201), respeitando as chaves de restrição do SQLite.

## CT05 - Operações CRUD de Games (Admin)
- **Objetivo**: Validar a criação, leitura, atualização e deleção de jogos no catálogo.
- **Ações**: 
  - GET `/api/games` (Listar todos os jogos).
  - POST `/api/games` (Criar novo jogo - Admin).
  - PUT `/api/games/:id` (Atualizar informações do jogo - Admin).
  - DELETE `/api/games/:id` (Deletar jogo - Admin).
- **Resultado Esperado**: Administradores podem executar todas as operações CRUD de jogos. Players comuns recebem status 403 ao tentar modificar (POST/PUT/DELETE) o catálogo.

## CT06 - Operações CRUD de Avaliações (Reviews)
- **Objetivo**: Garantir que usuários consigam criar, ler, editar e deletar suas próprias reviews.
- **Ações**:
  - GET `/api/reviews/game/:gameId` (Listar reviews de um jogo).
  - POST `/api/reviews` (Criar nova review para um jogo).
  - PUT `/api/reviews/:id` (Editar review existente do próprio usuário).
  - DELETE `/api/reviews/:id` (Remover review própria).
- **Resultado Esperado**: Criação e listagem bem-sucedidas. Restrição única ativa (um usuário não pode criar duas avaliações para o mesmo jogo). Usuários impedidos de modificar ou deletar reviews de terceiros (HTTP 403).

