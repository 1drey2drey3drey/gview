const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { authMiddleware, adminOnly } = require('../middlewares/auth');

// GET /api/submissions — listar todas as submissões (admin only)
router.get('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const submissions = await prisma.submission.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.json({ data: submissions, total: submissions.length });
  } catch (err) {
    console.error('Erro ao buscar submissões:', err);
    res.status(500).json({ error: 'Erro interno ao buscar submissões' });
  }
});

// POST /api/submissions — enviar submissão (público, sem autenticação)
router.post('/', async (req, res) => {
  const {
    gameTitle,
    projectUrl,
    description,
    launchPlans,
    targetPlatforms,
    launchDateRange,
    demoLink,
    nextFestParticipation,
    heardAbout,
    additionalInfo,
    contactRole,
    contactEmail,
    studioName,
    attachmentUrl,
  } = req.body;

  // Validação dos campos obrigatórios
  if (!gameTitle || !description || !contactEmail) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes: gameTitle, description, contactEmail' });
  }

  try {
    const submission = await prisma.submission.create({
      data: {
        gameTitle,
        projectUrl: projectUrl || null,
        description,
        launchPlans: launchPlans || null,
        targetPlatforms: targetPlatforms || null,
        launchDateRange: launchDateRange || null,
        demoLink: demoLink || null,
        nextFestParticipation: nextFestParticipation || false,
        heardAbout: heardAbout || null,
        additionalInfo: additionalInfo || null,
        contactRole: contactRole || null,
        contactEmail,
        studioName: studioName || null,
        attachmentUrl: attachmentUrl || null,
      },
    });

    res.status(201).json({
      message: 'Submissão recebida com sucesso! Entraremos em contato.',
      data: submission,
    });
  } catch (err) {
    console.error('Erro ao criar submissão:', err);
    res.status(500).json({ error: 'Erro interno ao criar submissão' });
  }
});

// PATCH /api/submissions/:id/status — aprovar ou rejeitar submissão (admin only)
router.patch('/:id/status', authMiddleware, adminOnly, async (req, res) => {
  const { status } = req.body;

  if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
    return res.status(400).json({ error: 'Status deve ser APPROVED ou REJECTED' });
  }

  try {
    const submission = await prisma.submission.update({
      where: { id: req.params.id },
      data: { reviewStatus: status },
    });

    res.json(submission);
  } catch (err) {
    console.error('Erro ao atualizar status da submissão:', err);
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Submissão não encontrada' });
    }
    res.status(500).json({ error: 'Erro interno ao atualizar status' });
  }
});

// DELETE /api/submissions/:id — deletar submissão (admin only)
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    await prisma.submission.delete({
      where: { id: req.params.id },
    });

    res.status(204).send();
  } catch (err) {
    console.error('Erro ao deletar submissão:', err);
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Submissão não encontrada' });
    }
    res.status(500).json({ error: 'Erro interno ao deletar submissão' });
  }
});

module.exports = router;
