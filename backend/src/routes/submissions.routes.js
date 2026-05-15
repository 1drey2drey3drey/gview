const express = require('express');
const router = express.Router();

// GET /api/submissions — listar (admin)
router.get('/', (req, res) => {
  res.json({ data: [], message: 'Implementação completa na Sprint 2' });
});

// POST /api/submissions — enviar submissão
router.post('/', (req, res) => {
  const { gameTitle, description, contactEmail } = req.body;
  if (!gameTitle || !description || !contactEmail) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes: gameTitle, description, contactEmail' });
  }
  // Sprint 2: persistir no banco via Prisma
  res.status(201).json({
    message: 'Submissão recebida com sucesso! Entraremos em contato.',
    data: { gameTitle, contactEmail, reviewStatus: 'PENDING' }
  });
});

// PATCH /api/submissions/:id/status — aprovar/rejeitar (admin)
router.patch('/:id/status', (req, res) => {
  res.status(501).json({ message: 'Implementação completa na Sprint 2' });
});

module.exports = router;
