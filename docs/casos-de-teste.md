# Casos de Teste (Sprint 2)

## CT01 - Criação de Game Jam
- **Objetivo**: Verificar se a API cria um Game Jam com sucesso.
- **Pré-condição**: Servidor rodando, payload JSON válido.
- **Ação**: POST /api/gamejams
- **Resultado Esperado**: Retorna status 201 e o objeto criado.

## CT02 - Importação da RAWG (Mock)
- **Objetivo**: Garantir que o endpoint de importação salva o jogo com dados mockados na ausência da chave.
- **Pré-condição**: Servidor sem RAWG_API_KEY.
- **Ação**: POST /api/rawg/import/123
- **Resultado Esperado**: Retorna 201, o título deve ser "Jogo Mockado RAWG 123".

## CT03 - Slugify Utility
- **Objetivo**: Verificar se a função utilitária converte strings complexas em slugs URL-friendly.
- **Ação**: Chamar `slugify('Hollow Knight: Silksong')`
- **Resultado Esperado**: O retorno deve ser `'hollow-knight-silksong'`.
