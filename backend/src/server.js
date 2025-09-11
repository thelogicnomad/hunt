import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';
import submissionRoutes from './routes/submissionRoutes.js';

dotenv.config();

// Initialize DB
// Initialize DB
connectDB();

const app = express();

// Trust first proxy (Vercel adds X-Forwarded-For)
app.set('trust proxy', 1);

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
// Ensure headers even if route not matched by cors middleware (safety net)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-secret, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  next();
});
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

// Start server only if not running in a serverless environment
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;
