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

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:5173', 'https://hunt-iota.vercel.app'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-admin-secret', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable pre-flight for all routes

app.use(express.json());

// Basic rate limiting
const limiter = rateLimit({ windowMs: 60 * 1000, max: 30 });
app.use(limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Routes
app.use('/', submissionRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: '404: NOT_FOUND', error: 'The requested resource was not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
