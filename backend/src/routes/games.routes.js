const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { authMiddleware, adminOnly } = require('../middlewares/auth');
const { slugify } = require('../utils/slugify');

// RAWG API configuration
const RAWG_BASE = 'https://api.rawg.io/api';
const RAWG_KEY = process.env.RAWG_API_KEY;

// Mock data — fallback caso o banco esteja vazio ou indisponível
const mockGames = [
  { id: '1', title: "Devil's Drizzle", slug: 'devils-drizzle', shortDescription: 'Plataformer 2D dark cute.', coverUrl: 'https://picsum.photos/seed/devils/300/400', status: 'FEATURED', genre: 'Plataformer 2D', studioName: 'Rainy Studio', demoUrl: 'https://example.com/demos/devils-drizzle' },
  { id: '2', title: 'Alien Strike', slug: 'alien-strike', shortDescription: 'Shooter retrô synthwave.', coverUrl: 'https://picsum.photos/seed/alien/300/400', status: 'FEATURED', genre: 'Shooter', studioName: 'NeonByte Games', demoUrl: 'https://example.com/demos/alien-strike' },
  { id: '3', title: 'Sunny Trails', slug: 'sunny-trails', shortDescription: 'Aventura tropical colorida.', coverUrl: 'https://picsum.photos/seed/sunny/300/400', status: 'AVAILABLE', genre: 'Aventura', studioName: 'Tropik Dev', demoUrl: 'https://example.com/demos/sunny-trails' },
  { id: '4', title: 'Alabaster Dawn', slug: 'alabaster-dawn', shortDescription: 'RPG aquarela profundo.', coverUrl: 'https://picsum.photos/seed/alabaster/300/400', status: 'COMING_SOON', genre: 'RPG', studioName: 'Chalk & Ember' },
  { id: '5', title: 'Scavland', slug: 'scavland', shortDescription: 'Horror atmosférico.', coverUrl: 'https://picsum.photos/seed/scavland/300/400', status: 'COMING_SOON', genre: 'Horror', studioName: 'DarkCell Studio' },
];

// Gera slug a partir do título
function generateSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9]+/g, '-')    // Substitui caracteres especiais por hífen
    .replace(/^-|-$/g, '');          // Remove hífens nas extremidades
}

// GET /api/games — lista todos os jogos (com filtro opcional por status)
router.get('/', async (req, res) => {
  const { status } = req.query;

  try {
    const where = status ? { status } : {};
    const games = await prisma.game.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Fallback para mock se o banco estiver vazio
    if (games.length === 0) {
      const fallback = status ? mockGames.filter(g => g.status === status) : mockGames;
      return res.json({ data: fallback, total: fallback.length, source: 'mock' });
    }

    res.json({ data: games, total: games.length });
  } catch (err) {
    console.error('Erro ao buscar jogos no banco, usando fallback:', err.message);
    const fallback = status ? mockGames.filter(g => g.status === status) : mockGames;
    res.json({ data: fallback, total: fallback.length, source: 'mock' });
  }
});

// GET /api/games/:slug — detalhe de um jogo por slug
router.get('/:slug', async (req, res) => {
  try {
    let game = await prisma.game.findUnique({ where: { slug: req.params.slug } });

    if (!game) {
      // Extract RAWG ID from slug (assumes format name-rawgId)
      const parts = req.params.slug.split('-');
      const rawgId = parts[parts.length - 1];

      // Try to fetch from RAWG API
      const url = `${RAWG_BASE}/games/${rawgId}?key=${RAWG_KEY}`;
      const response = await fetch(url);

      if (response.ok) {
        const g = await response.json();
        const slug = `${slugify(g.name)}-${rawgId}`;
        game = await prisma.game.create({
          data: {
            title: g.name,
            slug,
            shortDescription: (g.description_raw || '').substring(0, 100) + '...',
            fullDescription: g.description_raw || '',
            coverUrl: g.background_image,
            genre: g.genres ? g.genres.map(gg => gg.name).join(', ') : '',
            studioName: (g.developers && g.developers.length) ? g.developers[0].name : null,
            launchWindow: g.released,
            status: 'AVAILABLE',
          },
        });
      } else {
        // Fallback to mock data if RAWG request fails
        const mock = mockGames.find(g => g.slug === req.params.slug);
        if (!mock) return res.status(404).json({ error: 'Jogo não encontrado' });
        // Ensure mock game exists in DB
        const existing = await prisma.game.findUnique({ where: { slug: mock.slug } });
        if (!existing) {
          await prisma.game.create({
            data: {
              title: mock.title,
              slug: mock.slug,
              shortDescription: mock.shortDescription,
              coverUrl: mock.coverUrl,
              genre: mock.genre,
              studioName: mock.studioName,
              status: mock.status,
              launchWindow: null,
            },
          });
        }
        return res.json({ ...mock, source: 'mock' });
      }
    }

    res.json(game);
  } catch (err) {
    console.error('Erro ao buscar ou importar jogo:', err);
    res.status(500).json({ error: 'Erro interno ao buscar jogo' });
  }
});

// POST /api/games — criar jogo (admin only)
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  const { title, shortDescription, fullDescription, coverUrl, trailerUrl, demoUrl, status, genre, studioName, launchWindow } = req.body;

  if (!title || !shortDescription) {
    return res.status(400).json({ error: 'Título e descrição curta são obrigatórios' });
  }

  try {
    const slug = generateSlug(title);

    const game = await prisma.game.create({
      data: {
        title,
        slug,
        shortDescription,
        fullDescription: fullDescription || null,
        coverUrl: coverUrl || null,
        trailerUrl: trailerUrl || null,
        demoUrl: demoUrl || null,
        status: status || 'AVAILABLE',
        genre: genre || null,
        studioName: studioName || null,
        launchWindow: launchWindow || null,
      },
    });

    res.status(201).json(game);
  } catch (err) {
    console.error('Erro ao criar jogo:', err);
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Já existe um jogo com esse slug/título' });
    }
    res.status(500).json({ error: 'Erro interno ao criar jogo' });
  }
});

// PUT /api/games/:id — atualizar jogo (admin only)
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  const { title, shortDescription, fullDescription, coverUrl, trailerUrl, demoUrl, status, genre, studioName, launchWindow } = req.body;

  try {
    const data = {};
    if (title) {
      data.title = title;
      data.slug = generateSlug(title);
    }
    if (shortDescription !== undefined) data.shortDescription = shortDescription;
    if (fullDescription !== undefined) data.fullDescription = fullDescription;
    if (coverUrl !== undefined) data.coverUrl = coverUrl;
    if (trailerUrl !== undefined) data.trailerUrl = trailerUrl;
    if (demoUrl !== undefined) data.demoUrl = demoUrl;
    if (status !== undefined) data.status = status;
    if (genre !== undefined) data.genre = genre;
    if (studioName !== undefined) data.studioName = studioName;
    if (launchWindow !== undefined) data.launchWindow = launchWindow;

    const game = await prisma.game.update({
      where: { id: req.params.id },
      data,
    });

    res.json(game);
  } catch (err) {
    console.error('Erro ao atualizar jogo:', err);
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Jogo não encontrado' });
    }
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Já existe um jogo com esse slug/título' });
    }
    res.status(500).json({ error: 'Erro interno ao atualizar jogo' });
  }
});

// DELETE /api/games/:id — remover jogo (admin only)
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    await prisma.game.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  } catch (err) {
    console.error('Erro ao deletar jogo:', err);
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Jogo não encontrado' });
    }
    res.status(500).json({ error: 'Erro interno ao deletar jogo' });
  }
});

module.exports = router;
