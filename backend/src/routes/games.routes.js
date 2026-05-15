const express = require('express');
const router = express.Router();

// Mock data para Sprint 1 — substituir por Prisma na Sprint 2
const mockGames = [
  { id: '1', title: "Devil's Drizzle", slug: 'devils-drizzle', shortDescription: 'Plataformer 2D dark cute.', coverUrl: 'https://picsum.photos/seed/devils/300/400', status: 'FEATURED', genre: 'Plataformer 2D', studioName: 'Rainy Studio', demoUrl: 'https://example.com/demos/devils-drizzle' },
  { id: '2', title: 'Alien Strike', slug: 'alien-strike', shortDescription: 'Shooter retrô synthwave.', coverUrl: 'https://picsum.photos/seed/alien/300/400', status: 'FEATURED', genre: 'Shooter', studioName: 'NeonByte Games', demoUrl: 'https://example.com/demos/alien-strike' },
  { id: '3', title: 'Sunny Trails', slug: 'sunny-trails', shortDescription: 'Aventura tropical colorida.', coverUrl: 'https://picsum.photos/seed/sunny/300/400', status: 'AVAILABLE', genre: 'Aventura', studioName: 'Tropik Dev', demoUrl: 'https://example.com/demos/sunny-trails' },
  { id: '4', title: 'Alabaster Dawn', slug: 'alabaster-dawn', shortDescription: 'RPG aquarela profundo.', coverUrl: 'https://picsum.photos/seed/alabaster/300/400', status: 'COMING_SOON', genre: 'RPG', studioName: 'Chalk & Ember' },
  { id: '5', title: 'Scavland', slug: 'scavland', shortDescription: 'Horror atmosférico.', coverUrl: 'https://picsum.photos/seed/scavland/300/400', status: 'COMING_SOON', genre: 'Horror', studioName: 'DarkCell Studio' },
];

// GET /api/games — lista todos
router.get('/', (req, res) => {
  const { status } = req.query;
  const games = status ? mockGames.filter(g => g.status === status) : mockGames;
  res.json({ data: games, total: games.length });
});

// GET /api/games/:slug — detalhe
router.get('/:slug', (req, res) => {
  const game = mockGames.find(g => g.slug === req.params.slug);
  if (!game) return res.status(404).json({ error: 'Jogo não encontrado' });
  res.json(game);
});

// POST /api/games — criar (admin) — implementar na Sprint 2
router.post('/', (req, res) => {
  res.status(501).json({ message: 'Implementação completa na Sprint 2' });
});

// PUT /api/games/:id — editar (admin) — implementar na Sprint 2
router.put('/:id', (req, res) => {
  res.status(501).json({ message: 'Implementação completa na Sprint 2' });
});

// DELETE /api/games/:id — remover (admin) — implementar na Sprint 2
router.delete('/:id', (req, res) => {
  res.status(501).json({ message: 'Implementação completa na Sprint 2' });
});

module.exports = router;
