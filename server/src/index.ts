import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import itemRoutes from './routes/itemRoutes';
import userRoutes from './routes/userRoutes';
import { query } from './db/index';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/user', userRoutes);

// Cleanup task: Delete expired items every hour
setInterval(async () => {
  try {
    const result = await query('DELETE FROM items WHERE expires_at < NOW()');
    if (result.rowCount && result.rowCount > 0) {
      console.log(`Cleaned up ${result.rowCount} expired items`);
    }
  } catch (error) {
    console.error('Cleanup task failed:', error);
  }
}, 60 * 60 * 1000);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});