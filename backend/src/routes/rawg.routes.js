const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { slugify } = require('../utils/slugify');

const RAWG_BASE = 'https://api.rawg.io/api';
const RAWG_KEY  = process.env.RAWG_API_KEY;

// Helper: importa ou retorna jogo já existente do banco local
async function importOrGetGame(rawgId) {
  if (!RAWG_KEY) throw new Error('RAWG_API_KEY não configurada');

  const url = `${RAWG_BASE}/games/${rawgId}?key=${RAWG_KEY}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Jogo não encontrado na RAWG');
  const g = await response.json();

  const gameSlug = `${slugify(g.name)}-${rawgId}`;
  const existing = await prisma.game.findUnique({ where: { slug: gameSlug } });
  if (existing) return existing;

  const rawDescription = g.description_raw || (g.description ? g.description.replace(/<[^>]*>/g, '') : '');
  return await prisma.game.create({
    data: {
      title: g.name,
      slug: gameSlug,
      shortDescription: rawDescription ? rawDescription.substring(0, 100) + '...' : 'Descrição indisponível',
      fullDescription: rawDescription,
      coverUrl: g.background_image,
      genre: g.genres ? g.genres.map(genre => genre.name).join(', ') : '',
      studioName: g.developers && g.developers.length ? g.developers[0].name : null,
      launchWindow: g.released,
      status: 'AVAILABLE',
    },
  });
}

// Exporta o helper para uso em outros módulos (reviews, wishlist)
module.exports.importOrGetGame = importOrGetGame;

// GET /api/rawg/games — lista jogos populares/trending da RAWG para a Home
router.get('/games', async (req, res) => {
  const { page = 1, page_size = 20, genre, ordering = '-rating' } = req.query;
  if (!RAWG_KEY) {
    return res.status(503).json({ error: 'RAWG_API_KEY não configurada no .env' });
  }
  try {
    let url = `${RAWG_BASE}/games?page=${page}&page_size=${page_size}&ordering=${ordering}&key=${RAWG_KEY}`;
    if (genre) url += `&genres=${encodeURIComponent(genre)}`;
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Erro ao consultar a RAWG API' });
    }
    const data = await response.json();
    const results = (data.results || []).map(g => ({
      rawgId:       g.id,
      name:         g.name,
      released:     g.released,
      coverUrl:     g.background_image,
      genres:       (g.genres || []).map(genre => genre.name),
      rating:       g.rating,
      ratingsCount: g.ratings_count,
      slug:         String(g.id),
    }));
    res.json({ data: results, total: data.count, next: data.next, previous: data.previous });
  } catch (err) {
    res.status(500).json({ error: 'Falha na integração com a RAWG API', detail: err.message });
  }
});

// GET /api/rawg/search?q=hollow+knight
router.get('/search', async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ error: 'Parâmetro q é obrigatório' });
  }
  if (!RAWG_KEY) {
    return res.status(503).json({ error: 'RAWG_API_KEY não configurada no .env' });
  }
  try {
    const url = `${RAWG_BASE}/games?search=${encodeURIComponent(q)}&page_size=12&key=${RAWG_KEY}`;
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Erro ao consultar a RAWG API' });
    }
    const data = await response.json();
    const results = (data.results || []).map(g => ({
      rawgId:       g.id,
      name:         g.name,
      released:     g.released,
      coverUrl:     g.background_image,
      genres:       (g.genres || []).map(genre => genre.name),
      rating:       g.rating,
      ratingsCount: g.ratings_count,
      slug:         String(g.id),
    }));
    res.json({ data: results, total: results.length });
  } catch (err) {
    res.status(500).json({ error: 'Falha na integração com a RAWG API', detail: err.message });
  }
});

// GET /api/rawg/game/:rawgId — detalhes de um jogo específico
router.get('/game/:rawgId', async (req, res) => {
  if (!RAWG_KEY) {
    return res.status(503).json({ error: 'RAWG_API_KEY não configurada no .env' });
  }
  try {
    const url = `${RAWG_BASE}/games/${req.params.rawgId}?key=${RAWG_KEY}`;
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Jogo não encontrado na RAWG' });
    }
    const g = await response.json();
    res.json({
      rawgId:      g.id,
      name:        g.name,
      description: g.description_raw,
      released:    g.released,
      coverUrl:    g.background_image,
      website:     g.website,
      genres:      (g.genres || []).map(genre => genre.name),
      platforms:   (g.platforms || []).map(p => p.platform.name),
      rating:      g.rating,
    });
  } catch (err) {
    res.status(500).json({ error: 'Falha na integração com a RAWG API', detail: err.message });
  }
});

// POST /api/rawg/import/:rawgId
// Importa jogo da RAWG para o banco local.
// Se já importado, retorna o jogo existente (200 em vez de 409).
router.post('/import/:rawgId', async (req, res) => {
  const { rawgId } = req.params;

  if (!RAWG_KEY) {
    return res.status(503).json({ error: 'RAWG_API_KEY não configurada no .env' });
  }

  try {
    const url = `${RAWG_BASE}/games/${rawgId}?key=${RAWG_KEY}`;
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Jogo não encontrado na RAWG' });
    }
    const gameData = await response.json();

    const gameSlug = `${slugify(gameData.name)}-${rawgId}`;

    // Se já existe, retorna o existente (sem erro 409)
    const existing = await prisma.game.findUnique({ where: { slug: gameSlug } });
    if (existing) {
      return res.status(200).json({ message: 'Jogo já importado', game: existing });
    }

    const rawDescription = gameData.description_raw ||
      (gameData.description ? gameData.description.replace(/<[^>]*>/g, '') : '');

    const savedGame = await prisma.game.create({
      data: {
        title: gameData.name,
        slug: gameSlug,
        shortDescription: rawDescription ? rawDescription.substring(0, 100) + '...' : 'Descrição indisponível',
        fullDescription: rawDescription,
        coverUrl: gameData.background_image,
        genre: gameData.genres ? gameData.genres.map(g => g.name).join(', ') : '',
        studioName: gameData.developers && gameData.developers.length ? gameData.developers[0].name : null,
        launchWindow: gameData.released,
        status: 'AVAILABLE',
      },
    });

    res.status(201).json({ message: 'Jogo importado com sucesso', game: savedGame });
  } catch (err) {
    console.error('Erro ao importar jogo:', err);
    res.status(500).json({ error: 'Falha ao importar e salvar o jogo', detail: err.message });
  }
});

// Exporta o router
const rawgRouter = router;
module.exports = rawgRouter;
module.exports.importOrGetGame = importOrGetGame;
