const express = require('express');
const router = express.Router();

router.get('/game/:gameId', (req, res) => {
  res.json({ data: [], message: 'Implementação completa na Sprint 2' });
});

router.post('/', (req, res) => {
  res.status(501).json({ message: 'Implementação completa na Sprint 2' });
});

router.delete('/:id', (req, res) => {
  res.status(501).json({ message: 'Implementação completa na Sprint 2' });
});

module.exports = router;
