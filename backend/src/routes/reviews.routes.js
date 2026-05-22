const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { authMiddleware } = require('../middlewares/auth');

// GET /api/reviews/game/:gameId — lista todas as reviews de um jogo
router.get('/game/:gameId', async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { gameId: req.params.gameId },
      include: {
        user: { select: { id: true, name: true } },
      },
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
  const { gameId, rating, comment } = req.body;

  if (!gameId || !rating) {
    return res.status(400).json({ error: 'gameId e rating são obrigatórios' });
  }

  // Validação do rating (1 a 5)
  const ratingNum = parseInt(rating, 10);
  if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return res.status(400).json({ error: 'Rating deve ser um número entre 1 e 5' });
  }

  try {
    const review = await prisma.review.create({
      data: {
        userId: req.user.id,
        gameId,
        rating: ratingNum,
        comment: comment || null,
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    res.status(201).json(review);
  } catch (err) {
    console.error('Erro ao criar review:', err);
    // Unique constraint — usuário já fez review deste jogo
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Você já avaliou este jogo' });
    }
    if (err.code === 'P2003') {
      return res.status(404).json({ error: 'Jogo não encontrado' });
    }
    res.status(500).json({ error: 'Erro interno ao criar review' });
  }
});

// PUT /api/reviews/:id — atualizar review própria
router.put('/:id', authMiddleware, async (req, res) => {
  const { rating, comment } = req.body;

  try {
    // Verificar se a review pertence ao usuário
    const existing = await prisma.review.findUnique({ where: { id: req.params.id } });

    if (!existing) {
      return res.status(404).json({ error: 'Review não encontrada' });
    }

    if (existing.userId !== req.user.id) {
      return res.status(403).json({ error: 'Você só pode editar suas próprias reviews' });
    }

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
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    res.json(review);
  } catch (err) {
    console.error('Erro ao atualizar review:', err);
    res.status(500).json({ error: 'Erro interno ao atualizar review' });
  }
});

// DELETE /api/reviews/:id — deletar review própria
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    // Verificar se a review pertence ao usuário
    const existing = await prisma.review.findUnique({ where: { id: req.params.id } });

    if (!existing) {
      return res.status(404).json({ error: 'Review não encontrada' });
    }

    if (existing.userId !== req.user.id) {
      return res.status(403).json({ error: 'Você só pode deletar suas próprias reviews' });
    }

    await prisma.review.delete({ where: { id: req.params.id } });

    res.status(204).send();
  } catch (err) {
    console.error('Erro ao deletar review:', err);
    res.status(500).json({ error: 'Erro interno ao deletar review' });
  }
});

module.exports = router;
