require('dotenv').config();
const express = require('express');
const cors = require('cors');

const gamesRouter = require('./routes/games.routes');
const submissionsRouter = require('./routes/submissions.routes');
const authRouter = require('./routes/auth.routes');
const wishlistRouter = require('./routes/wishlist.routes');
const reviewsRouter = require('./routes/reviews.routes');
const rawgRouter = require('./routes/rawg.routes');
const gameJamsRouter = require('./routes/gameJams.routes');
const collectionsRouter = require('./routes/collections.routes');
const usersRouter = require('./routes/users.routes');

const app = express();

// Oculta o header X-Powered-By para não expor a versão do Express
app.disable('x-powered-by');

const PORT = process.env.PORT || 3001;

// Restringe CORS apenas às origens permitidas
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // Permite requisições sem origin (ex: Postman, testes server-side)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());

app.use('/api/games', gamesRouter);
app.use('/api/submissions', submissionsRouter);
app.use('/api/auth', authRouter);
app.use('/api/wishlist', wishlistRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/rawg', rawgRouter);
app.use('/api/gamejams', gameJamsRouter);
app.use('/api/collections', collectionsRouter);
app.use('/api/users', usersRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', platform: 'Gview API', version: '2.0.0' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Gview API rodando em http://localhost:${PORT}`);
  });
}

module.exports = app;