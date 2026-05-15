# Integração com API Externa — RAWG Video Games Database

**API:** RAWG Video Games Database  
**Documentação:** https://rawg.io/apidocs  
**Endpoint base:** `https://api.rawg.io/api`

---

## Justificativa

A RAWG é a maior base de dados pública de jogos, com cobertura de mais de 500 mil títulos, suporte a gêneros, plataformas, imagens e metadados variados. A integração é diretamente aderente ao domínio do Gview porque:

- Permite enriquecer o catálogo com dados reais (capas, descrições, gêneros) sem esforço de curadoria manual.
- É gratuita para uso acadêmico e de baixo volume.
- A chave de API é simples de obter e o SDK é consumido por HTTP puro.
- A integração é feita no **backend**, evitando exposição da chave no navegador.

---

## Uso previsto no Gview

| Funcionalidade | Endpoint RAWG |
|---|---|
| Buscar metadados de jogo por nome | `GET /games?search={query}` |
| Obter detalhes de um jogo específico | `GET /games/{id}` |
| Listar gêneros disponíveis | `GET /genres` |

---

## Rota stub implementada (Sprint 1)

```
GET /api/rawg/search?q={query}
```

Retorna os primeiros resultados da RAWG para o termo buscado. A rota já está funcional e pode ser testada com a chave configurada em `.env` (`RAWG_API_KEY`).

---

## Configuração

Adicionar no `.env`:

```
RAWG_API_KEY=sua_chave_rawg_aqui
```

Obter chave gratuita em: https://rawg.io/login?forward=developer
