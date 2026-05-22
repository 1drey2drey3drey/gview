# Plano de Testes e Guia de Auditoria — Gview

Este documento serve como guia completo sobre a suíte de testes do **Gview**, descrevendo como rodar os testes unitários e de integração, o que cada cenário de teste valida, e como gerar e interpretar o relatório de auditoria automatizado.

---

## 1. Como Rodar os Testes

Todos os testes são executados utilizando o **Vitest**. A seguir estão listadas as instruções para preparar o ambiente e rodar os testes.

### Pré-requisitos
1. Certifique-se de que as dependências do backend estão instaladas:
   ```bash
   cd backend
   npm install
   ```
2. O banco de dados SQLite local deve estar criado. Caso contrário, execute:
   ```bash
   npx prisma db push
   ```

### Executar a Suíte Padrão
Para rodar todos os testes uma única vez e ver o resultado no terminal:
```bash
npm run test
```

### Executar em Modo de Observação (Watch Mode)
Para rodar os testes de forma interativa, observando mudanças de arquivos em tempo real:
```bash
npm run test:watch
```

---

## 2. Relatório de Auditoria dos Testes

Para fins de entregas acadêmicas, integração contínua (CI) ou auditorias de qualidade de software, configuramos um script especial que executa os testes e exporta um arquivo de relatório em formato estruturado (JSON).

### Como Gerar o Arquivo de Auditoria
No diretório `backend`, execute o comando:
```bash
npm run test:audit
```

### Resultados Esperados:
1. Os testes serão exibidos de forma legível no terminal.
2. Será criado um arquivo na raiz do backend chamado **`test-audit-report.json`**.
3. O arquivo gerado conterá metadados detalhados de execução (tempo total de execução, número de testes bem-sucedidos/falhos e detalhes de cada asserção).

---

## 3. Catálogo e Descrição de Cenários de Teste

Nossos testes cobrem desde funções utilitárias isoladas até fluxos completos de chamadas HTTP integradas ao banco de dados SQLite.

### 3.1. Testes Unitários (`tests/unit`)

#### `slugify.test.js`
Valida a função utilitária de geração de slugs legíveis para URLs (limpeza de caracteres especiais, conversão para minúsculas e substituição de espaços por hífens).
- **Caso 1**: Deve converter `'Hollow Knight: Silksong'` para `'hollow-knight-silksong'`.
- **Caso 2**: Deve remover espaços extras das extremidades como `'  Meu Jogo  Legal  '` para `'meu-jogo-legal'`.
- **Caso 3**: Deve tratar acentuações e caracteres especiais como `'Ação & Aventura 2026!'` para `'ao-aventura-2026'`.

---

### 3.2. Testes de Integração (`tests/integration`)

#### `auth.test.js` (CRUD de Conta e Autenticação)
Testa os fluxos de registro, login e gerenciamento de perfil com JWT.
- **Caso 1 (Register)**: Registra um novo usuário no banco de dados e verifica se um JWT válido e os dados do usuário são retornados.
- **Caso 2 (Duplicate Check)**: Garante que o sistema impede registros de e-mails duplicados, retornando `409 Conflict`.
- **Caso 3 (Login)**: Valida o login de um usuário cadastrado com credenciais corretas.
- **Caso 4 (Invalid Login)**: Garante a rejeição de login com senhas incorretas (`401 Unauthorized`).
- **Caso 5 (Profile Lookup)**: Valida a recuperação das informações da própria conta (`GET /api/auth/me`) enviando um JWT no cabeçalho.
- **Caso 6 (Update Profile)**: Valida se o usuário autenticado consegue alterar o próprio nome de exibição.
- **Caso 7 (Delete Account)**: Testa a exclusão total da conta do usuário autenticado e verifica a remoção dos registros no banco.

#### `games.test.js` (CRUD de Catálogo de Jogos)
Valida a persistência e restrições de privilégios administrativos nas operações de gerenciamento de jogos.
- **Caso 1 (List)**: Verifica o retorno da listagem de jogos cadastrados no banco de dados.
- **Caso 2 (Admin Create)**: Valida a criação de um jogo por um usuário com papel de `ADMIN` (retorno esperado: `201 Created`).
- **Caso 3 (Player Create Blocked)**: Garante que um usuário comum com papel de `PLAYER` seja bloqueado ao tentar cadastrar jogos (`403 Forbidden`).
- **Caso 4 (Fetch Detail)**: Verifica a busca detalhada de um jogo pelo seu slug único.
- **Caso 5 (Admin Update)**: Testa a edição de informações do jogo no banco por um administrador.
- **Caso 6 (Admin Delete)**: Valida a remoção física de um jogo do catálogo por um administrador.

#### `rawg.test.js` (Integração com API Externa RAWG)
Testa a conectividade, mapeamento de dados e segurança do endpoint importador. Para manter a estabilidade em ambientes locais e de CI, as requisições http externas são mockadas com spies sobre a API do `fetch`.
- **Caso 1 (Search)**: Simula a pesquisa de termos na RAWG (ex: "gta") e valida o mapeamento de IDs da RAWG, títulos, notas e imagens no JSON final.
- **Caso 2 (Get Details)**: Testa a rota de detalhes de jogos da RAWG API mapeando plataformas e gêneros.
- **Caso 3 (Admin Import)**: Testa a importação completa de dados reais da RAWG e persistência final no banco local (geração de slug inteligente e criação da entidade).
- **Caso 4 (Player Import Blocked)**: Garante que o endpoint `/api/rawg/import/:rawgId` exige token de administrador, bloqueando contas `PLAYER`.

#### `reviews.test.js` (CRUD de Avaliações)
Testa a lógica de negócio associada a comentários e notas atribuídos a jogos.
- **Caso 1 (Create Review)**: Insere uma avaliação no banco com nota e comentário textual associados ao jogo.
- **Caso 2 (List reviews)**: Lista todas as avaliações cadastradas de um jogo específico.
- **Caso 3 (Unique constraint)**: Garante que um mesmo usuário não consiga avaliar o mesmo jogo mais de uma vez (`409 Conflict`).
- **Caso 4 (Update own review)**: Permite ao usuário editar a sua nota e comentários já salvos.
- **Caso 5 (Unauthorized update)**: Bloqueia tentativas de edição de reviews pertencentes a outros usuários (`403 Forbidden`).
- **Caso 6 (Delete own review)**: Permite a remoção de uma avaliação pelo próprio autor.
- **Caso 7 (Unauthorized delete)**: Bloqueia tentativas de remoção de reviews alheias (`403 Forbidden`).
