const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { authMiddleware } = require('../middlewares/auth');
const { slugify } = require('../utils/slugify');

const RAWG_BASE = 'https://api.rawg.io/api';
const RAWG_KEY  = process.env.RAWG_API_KEY;

// Helper interno: garante que um jogo RAWG exista no banco antes de criar review/wishlist
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

// GET /api/reviews/game/:gameId — lista todas as reviews de um jogo
router.get('/game/:gameId', async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { gameId: req.params.gameId },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ data: reviews, total: reviews.length });
  } catch (err) {
    console.error('Erro ao buscar reviews:', err);
    res.status(500).json({ error: 'Erro interno ao buscar reviews' });
  }
});

// POST /api/reviews — criar review (usuário autenticado)
router.post('/', authMiddleware, async (req, res) => {
  let gameId = req.body.gameId;
  const { rating, comment } = req.body;

  if (!gameId || rating === undefined) {
    return res.status(400).json({ error: 'gameId e rating são obrigatórios' });
  }

  const ratingNum = parseInt(rating, 10);
  if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return res.status(400).json({ error: 'Rating deve ser um número entre 1 e 5' });
  }

  // Se for um rawgId numérico, importar o jogo direto via Prisma (sem HTTP)
  const isRawgId = /^\d+$/.test(String(gameId));
  if (isRawgId) {
    try {
      const importedGame = await ensureRawgGameExists(gameId);
      gameId = importedGame.id;
    } catch (e) {
      console.error('Erro ao importar jogo da RAWG para review:', e.message);
      return res.status(404).json({ error: 'Jogo não encontrado na RAWG' });
    }
  } else {
    const existingGame = await prisma.game.findUnique({ where: { id: gameId } });
    if (!existingGame) {
      return res.status(404).json({ error: 'Jogo não encontrado' });
    }
  }

  try {
    const review = await prisma.review.create({
      data: {
        userId: req.user.id,
        gameId,
        rating: ratingNum,
        comment: comment || null,
      },
      include: { user: { select: { id: true, name: true } } },
    });
    res.status(201).json(review);
  } catch (err) {
    console.error('Erro ao criar review:', err);
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Você já avaliou este jogo' });
    }
    if (err.code === 'P2003') {
      return res.status(404).json({ error: 'Jogo não encontrado' });
    }
    res.status(500).json({ error: 'Erro interno ao criar review' });
  }
});

// PUT /api/reviews/:id — editar própria review
router.put('/:id', authMiddleware, async (req, res) => {
  const { rating, comment } = req.body;
  try {
    const existing = await prisma.review.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Review não encontrada' });
    if (existing.userId !== req.user.id) return res.status(403).json({ error: 'Você só pode editar suas próprias reviews' });

    const data = {};
    if (rating !== undefined) {
      const ratingNum = parseInt(rating, 10);
      if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        return res.status(400).json({ error: 'Rating deve ser um número entre 1 e 5' });
      }
      data.rating = ratingNum;
    }
    if (comment !== undefined) data.comment = comment;

    const review = await prisma.review.update({
      where: { id: req.params.id },
      data,
      include: { user: { select: { id: true, name: true } } },
    });
    res.json(review);
  } catch (err) {
    console.error('Erro ao atualizar review:', err);
    res.status(500).json({ error: 'Erro interno ao atualizar review' });
  }
});

// DELETE /api/reviews/:id — deletar própria review
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const existing = await prisma.review.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Review não encontrada' });
    if (existing.userId !== req.user.id) return res.status(403).json({ error: 'Você só pode deletar suas próprias reviews' });
    await prisma.review.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    console.error('Erro ao deletar review:', err);
    res.status(500).json({ error: 'Erro interno ao deletar review' });
  }
});

module.exports = router;
