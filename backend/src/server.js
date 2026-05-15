require('dotenv').config();
const express = require('express');
const cors = require('cors');

const gamesRouter = require('./routes/games.routes');
const submissionsRouter = require('./routes/submissions.routes');
const authRouter = require('./routes/auth.routes');
const wishlistRouter = require('./routes/wishlist.routes');
const reviewsRouter = require('./routes/reviews.routes');
const rawgRouter = require('./routes/rawg.routes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/games', gamesRouter);
app.use('/api/submissions', submissionsRouter);
app.use('/api/auth', authRouter);
app.use('/api/wishlist', wishlistRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/rawg', rawgRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', platform: 'Gview API', version: '1.0.0' });
});

app.listen(PORT, () => {
  console.log(`Gview API rodando em http://localhost:${PORT}`);
});

module.exports = app;
