# Casos de Uso — Gview

## UC01 — Visualizar demos em destaque
- **Ator:** visitante.
- **Pré-condição:** jogos marcados como destaque existem no sistema.
- **Fluxo principal:** visitante acessa a home; sistema exibe seção de destaques.
- **Fluxo alternativo:** nenhum jogo em destaque; sistema mostra estado vazio.
- **Pós-condição:** visitante identifica demos prioritárias.

## UC02 — Visualizar todas as demos
- **Ator:** visitante.
- **Pré-condição:** catálogo disponível.
- **Fluxo principal:** visitante acessa a listagem geral; sistema exibe todas as demos disponíveis.
- **Fluxo alternativo:** catálogo vazio.
- **Pós-condição:** usuário consulta o acervo.

## UC03 — Visualizar demos em breve
- **Ator:** visitante.
- **Pré-condição:** jogos com status `COMING_SOON` existem.
- **Fluxo principal:** visitante acessa a seção; sistema lista futuras demos.
- **Fluxo alternativo:** nenhuma demo futura cadastrada.
- **Pós-condição:** visitante visualiza próximos lançamentos.

## UC04 — Ver detalhes de um jogo
- **Ator:** visitante.
- **Pré-condição:** jogo cadastrado.
- **Fluxo principal:** visitante seleciona um card; sistema abre página de detalhes.
- **Fluxo alternativo:** jogo indisponível ou removido.
- **Pós-condição:** visitante lê informações completas.

## UC05 — Jogar uma demo
- **Ator:** visitante ou usuário autenticado.
- **Pré-condição:** jogo possui `demoUrl` válida.
- **Fluxo principal:** usuário clica em "Jogar"; sistema carrega a página da demo.
- **Fluxo alternativo:** demo indisponível; sistema informa erro.
- **Pós-condição:** demo é iniciada.

## UC06 — Cadastrar conta
- **Ator:** visitante.
- **Pré-condição:** e-mail não cadastrado.
- **Fluxo principal:** visitante preenche formulário; sistema cria conta.
- **Fluxo alternativo:** e-mail já utilizado ou dados inválidos.
- **Pós-condição:** conta registrada.

## UC07 — Realizar login
- **Ator:** usuário cadastrado.
- **Pré-condição:** conta ativa.
- **Fluxo principal:** usuário informa credenciais; sistema autentica acesso.
- **Fluxo alternativo:** credenciais inválidas.
- **Pós-condição:** sessão autenticada.

## UC08 — Adicionar jogo à wishlist
- **Ator:** usuário autenticado.
- **Pré-condição:** usuário logado; jogo existente.
- **Fluxo principal:** usuário aciona botão de lista; sistema grava vínculo.
- **Fluxo alternativo:** item já existe na lista.
- **Pós-condição:** wishlist atualizada.

## UC09 — Remover jogo da wishlist
- **Ator:** usuário autenticado.
- **Pré-condição:** item presente na wishlist.
- **Fluxo principal:** usuário remove o item; sistema atualiza lista.
- **Fluxo alternativo:** item não encontrado.
- **Pós-condição:** wishlist atualizada.

## UC10 — Visualizar wishlist
- **Ator:** usuário autenticado.
- **Pré-condição:** usuário logado.
- **Fluxo principal:** sistema exibe lista pessoal do usuário.
- **Fluxo alternativo:** wishlist vazia.
- **Pós-condição:** usuário acompanha jogos salvos.

## UC11 — Avaliar uma demo
- **Ator:** usuário autenticado.
- **Pré-condição:** jogo disponível; usuário autenticado.
- **Fluxo principal:** usuário envia nota e comentário; sistema persiste avaliação.
- **Fluxo alternativo:** dados inválidos ou avaliação duplicada.
- **Pós-condição:** avaliação registrada.

## UC12 — Enviar submissão de jogo
- **Ator:** desenvolvedor.
- **Pré-condição:** formulário acessível.
- **Fluxo principal:** desenvolvedor preenche dados e envia submissão.
- **Fluxo alternativo:** campos obrigatórios ausentes.
- **Pós-condição:** submissão registrada como pendente.

## UC13 — Consultar submissões recebidas
- **Ator:** administrador.
- **Pré-condição:** admin autenticado.
- **Fluxo principal:** admin acessa painel e lista submissões.
- **Fluxo alternativo:** sem submissões cadastradas.
- **Pós-condição:** admin visualiza fila de análise.

## UC14 — Aprovar ou rejeitar submissão
- **Ator:** administrador.
- **Pré-condição:** submissão existente e pendente.
- **Fluxo principal:** admin revisa e altera status.
- **Fluxo alternativo:** submissão já tratada.
- **Pós-condição:** estado final atualizado.

## UC15 — Editar dados de um jogo cadastrado
- **Ator:** administrador.
- **Pré-condição:** jogo existente.
- **Fluxo principal:** admin altera dados; sistema salva edição.
- **Fluxo alternativo:** dados inválidos.
- **Pós-condição:** jogo atualizado no catálogo.

## UC16 — Criar uma Game Jam
- **Ator:** administrador / desenvolvedor.
- **Pré-condição:** usuário autenticado com permissão.
- **Fluxo principal:** usuário acessa painel, preenche formulário de Game Jam e envia.
- **Fluxo alternativo:** datas conflitantes ou dados inválidos.
- **Pós-condição:** Game Jam registrada no sistema.

## UC17 — Listar Game Jams
- **Ator:** visitante.
- **Pré-condição:** catálogo de Game Jams disponível.
- **Fluxo principal:** visitante acessa página de Jams e visualiza as ativas e futuras.
- **Fluxo alternativo:** Nenhuma Jam ativa.
- **Pós-condição:** visitante vê as Jams.

## UC18 — Participar de uma Game Jam
- **Ator:** desenvolvedor.
- **Pré-condição:** usuário logado, Game Jam ativa.
- **Fluxo principal:** desenvolvedor vincula seu jogo à Jam.
- **Fluxo alternativo:** jogo já vinculado ou Jam finalizada.
- **Pós-condição:** participação registrada.

## UC19 — Importar Jogo da API RAWG
- **Ator:** administrador.
- **Pré-condição:** permissão administrativa.
- **Fluxo principal:** admin informa ID RAWG, sistema busca dados externos e salva como Jogo local.
- **Fluxo alternativo:** ID não encontrado ou erro de API.
- **Pós-condição:** jogo novo persistido no banco de dados.
