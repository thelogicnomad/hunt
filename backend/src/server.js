import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';
import submissionRoutes from './routes/submissionRoutes.js';

dotenv.config();

// Initialize DB
connectDB();

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// Basic rate limiting
const limiter = rateLimit({ windowMs: 60 * 1000, max: 30 });
app.use(limiter);

// Routes
app.use('/', submissionRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
