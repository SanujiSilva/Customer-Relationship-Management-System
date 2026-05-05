import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import { connectDB } from './config/db.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { authRouter } from './routes/authRoutes.js';
import { leadRouter } from './routes/leadRoutes.js';
import { seedDatabase } from './seed.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  })
);
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'CRM System API' });
});

app.use('/api/auth', authRouter);
app.use('/api/leads', leadRouter);
app.use(notFound);
app.use(errorHandler);

await connectDB();
await seedDatabase();

app.listen(port, () => {
  console.log(`CRM API running on http://localhost:${port}`);
});
