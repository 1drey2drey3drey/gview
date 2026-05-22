const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

const RAWG_BASE = 'https://api.rawg.io/api';
const RAWG_KEY  = process.env.RAWG_API_KEY;

// GET /api/rawg/search?q=hollow+knight
// Busca jogos na RAWG pelo nome. Usado para enriquecer metadados do catálogo.
router.get('/search', async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ error: 'Parâmetro q é obrigatório' });
  }
  if (!RAWG_KEY) {
    return res.status(503).json({ error: 'RAWG_API_KEY não configurada no .env' });
  }
  try {
    const url = `${RAWG_BASE}/games?search=${encodeURIComponent(q)}&page_size=5&key=${RAWG_KEY}`;
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Erro ao consultar a RAWG API' });
    }
    const data = await response.json();
    const results = (data.results || []).map(g => ({
      rawgId:      g.id,
      name:        g.name,
      released:    g.released,
      coverUrl:    g.background_image,
      genres:      (g.genres || []).map(genre => genre.name),
      rating:      g.rating,
      ratingsCount: g.ratings_count,
    }));
    res.json({ data: results, total: results.length });
  } catch (err) {
    res.status(500).json({ error: 'Falha na integração com a RAWG API', detail: err.message });
  }
});

// GET /api/rawg/game/:rawgId
// Retorna detalhes completos de um jogo específico pelo ID da RAWG.
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
// Puxa os dados da RAWG e salva no banco de dados local. Usa mock se a API KEY não estiver configurada.
router.post('/import/:rawgId', async (req, res) => {
  const { rawgId } = req.params;
  
  try {
    let gameData = {};

    if (!RAWG_KEY) {
      // Usando mock como combinado
      console.log('Utilizando mock para RAWG import, pois RAWG_API_KEY não foi encontrada.');
      gameData = {
        name: `Jogo Mockado RAWG ${rawgId}`,
        description_raw: 'Esta é uma descrição mockada para fins de teste da Sprint 2.',
        released: '2023-10-15',
        background_image: 'https://via.placeholder.com/600x400?text=Capa+Mockada',
        website: 'https://example.com',
        genres: [{ name: 'Action' }, { name: 'Indie' }],
        platforms: [{ platform: { name: 'PC' } }]
      };
    } else {
      const url = `${RAWG_BASE}/games/${rawgId}?key=${RAWG_KEY}`;
      const response = await fetch(url);
      if (!response.ok) {
        return res.status(response.status).json({ error: 'Jogo não encontrado na RAWG' });
      }
      gameData = await response.json();
    }

    // Salvar no BD
    const savedGame = await prisma.game.create({
      data: {
        title: gameData.name,
        slug: `${gameData.name.toLowerCase().replace(/\s+/g, '-')}-${rawgId}`,
        shortDescription: gameData.description_raw ? gameData.description_raw.substring(0, 100) + '...' : 'Descrição indisponível',
        fullDescription: gameData.description_raw,
        coverUrl: gameData.background_image,
        genre: gameData.genres ? gameData.genres.map(g => g.name).join(', ') : '',
        launchWindow: gameData.released,
        status: 'AVAILABLE'
      }
    });

    res.status(201).json({ message: 'Jogo importado com sucesso', game: savedGame });

  } catch (err) {
    console.error('Erro ao importar jogo:', err);
    res.status(500).json({ error: 'Falha ao importar e salvar o jogo', detail: err.message });
  }
});

module.exports = router;
