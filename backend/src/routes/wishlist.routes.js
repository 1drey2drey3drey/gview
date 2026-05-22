const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { authMiddleware } = require('../middlewares/auth');

// GET /api/wishlist/:userId — lista a wishlist de um usuário com dados do jogo
router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    const wishlist = await prisma.wishlist.findMany({
      where: { userId: req.params.userId },
      include: {
        game: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ data: wishlist, total: wishlist.length });
  } catch (err) {
    console.error('Erro ao buscar wishlist:', err);
    res.status(500).json({ error: 'Erro interno ao buscar wishlist' });
  }
});

// POST /api/wishlist — adicionar jogo à wishlist do usuário autenticado
router.post('/', authMiddleware, async (req, res) => {
  const { gameId } = req.body;

  if (!gameId) {
    return res.status(400).json({ error: 'gameId é obrigatório' });
  }

  try {
    const entry = await prisma.wishlist.create({
      data: {
        userId: req.user.id,
        gameId,
      },
      include: { game: true },
    });

    res.status(201).json(entry);
  } catch (err) {
    console.error('Erro ao adicionar à wishlist:', err);
    // Unique constraint violation — jogo já está na wishlist
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Jogo já está na sua wishlist' });
    }
    // Foreign key constraint — jogo não existe
    if (err.code === 'P2003') {
      return res.status(404).json({ error: 'Jogo não encontrado' });
    }
    res.status(500).json({ error: 'Erro interno ao adicionar à wishlist' });
  }
});

// DELETE /api/wishlist/:gameId — remover jogo da wishlist do usuário autenticado
router.delete('/:gameId', authMiddleware, async (req, res) => {
  try {
    // Usa a constraint única [userId, gameId] para deletar
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
