const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

// GET /api/gamejams - Listar todas as Game Jams
router.get('/', async (req, res) => {
  try {
    const gameJams = await prisma.gameJam.findMany({
      include: { creator: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(gameJams);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar Game Jams.' });
  }
});

// GET /api/gamejams/:id - Detalhes de uma Game Jam
router.get('/:id', async (req, res) => {
  try {
    const gameJam = await prisma.gameJam.findUnique({
      where: { id: req.params.id },
      include: {
        creator: { select: { name: true, email: true } },
        entries: {
          include: { game: true, developer: { select: { name: true } } }
        }
      }
    });
    if (!gameJam) return res.status(404).json({ error: 'Game Jam não encontrada.' });
    res.json(gameJam);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar Game Jam.' });
  }
});

// POST /api/gamejams - Criar uma Game Jam
router.post('/', async (req, res) => {
  const { title, description, theme, startDate, endDate, status, creatorId } = req.body;
  
  if (!title || !description || !startDate || !endDate || !creatorId) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
  }

  try {
    const gameJam = await prisma.gameJam.create({
      data: {
        title,
        description,
        theme,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: status || 'UPCOMING',
        creatorId
      }
    });
    res.status(201).json(gameJam);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar Game Jam.', detail: error.message });
  }
});

// PUT /api/gamejams/:id - Editar uma Game Jam
router.put('/:id', async (req, res) => {
  const { title, description, theme, startDate, endDate, status } = req.body;
  
  try {
    const gameJam = await prisma.gameJam.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(theme && { theme }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(status && { status }),
      }
    });
    res.json(gameJam);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar Game Jam.', detail: error.message });
  }
});

// DELETE /api/gamejams/:id - Excluir uma Game Jam
router.delete('/:id', async (req, res) => {
  try {
    await prisma.gameJam.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar Game Jam.', detail: error.message });
  }
});

module.exports = router;
