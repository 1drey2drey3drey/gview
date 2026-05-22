const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { authMiddleware } = require('../middlewares/auth');
const { slugify } = require('../utils/slugify');

const RAWG_BASE = 'https://api.rawg.io/api';
const RAWG_KEY  = process.env.RAWG_API_KEY;

// Helper interno: garante que jogo RAWG exista no banco
async function ensureRawgGameExists(rawgId) {
  if (!RAWG_KEY) throw new Error('RAWG_API_KEY não configurada');
  const url = `${RAWG_BASE}/games/${rawgId}?key=${RAWG_KEY}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Jogo não encontrado na RAWG');
  const g = await response.json();

  const gameSlug = `${slugify(g.name)}-${rawgId}`;
  const existing = await prisma.game.findUnique({ where: { slug: gameSlug } });
  if (existing) return existing;

  const rawDescription = g.description_raw ||
    (g.description ? g.description.replace(/<[^>]*>/g, '') : '');

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

// GET /api/wishlist/:userId — lista wishlist do usuário com dados do jogo
router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    const wishlist = await prisma.wishlist.findMany({
      where: { userId: req.params.userId },
      include: { game: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ data: wishlist, total: wishlist.length });
  } catch (err) {
    console.error('Erro ao buscar wishlist:', err);
    res.status(500).json({ error: 'Erro interno ao buscar wishlist' });
  }
});

// POST /api/wishlist — adiciona jogo à wishlist do usuário autenticado
router.post('/', authMiddleware, async (req, res) => {
  let { gameId } = req.body;

  if (!gameId) {
    return res.status(400).json({ error: 'gameId é obrigatório' });
  }

  // Se for rawgId numérico, garante que o jogo exista no banco primeiro
  const isRawgId = /^\d+$/.test(String(gameId));
  if (isRawgId) {
    try {
      const importedGame = await ensureRawgGameExists(gameId);
      gameId = importedGame.id;
    } catch (e) {
      console.error('Erro ao importar jogo da RAWG para wishlist:', e.message);
      return res.status(404).json({ error: 'Jogo não encontrado na RAWG' });
    }
  }

  try {
    const entry = await prisma.wishlist.create({
      data: { userId: req.user.id, gameId },
      include: { game: true },
    });
    res.status(201).json(entry);
  } catch (err) {
    console.error('Erro ao adicionar à wishlist:', err);
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Jogo já está na sua wishlist' });
    }
    if (err.code === 'P2003') {
      return res.status(404).json({ error: 'Jogo não encontrado' });
    }
    res.status(500).json({ error: 'Erro interno ao adicionar à wishlist' });
  }
});

// DELETE /api/wishlist/:gameId — remove jogo da wishlist do usuário autenticado
router.delete('/:gameId', authMiddleware, async (req, res) => {
  try {
    await prisma.wishlist.delete({
      where: {
        userId_gameId: {
          userId: req.user.id,
          gameId: req.params.gameId,
        },
      },
    });
    res.status(204).send();
  } catch (err) {
    console.error('Erro ao remover da wishlist:', err);
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Jogo não encontrado na sua wishlist' });
    }
    res.status(500).json({ error: 'Erro interno ao remover da wishlist' });
  }
});

module.exports = router;
