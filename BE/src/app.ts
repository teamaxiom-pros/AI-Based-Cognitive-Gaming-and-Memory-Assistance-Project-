import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { apiRouter } from './routes/api';

dotenv.config();

const app = express();

// Enable CORS for Frontend (development & production on Vercel)
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

// Request logging
app.use((req, _res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  }
  next();
});

// API Routes mounted on /api, /api/v1, and / for full serverless rewrite compatibility
app.use('/api', apiRouter);
app.use('/api/v1', apiRouter);
app.use('/', apiRouter);

// Root status
app.get('/', (_req, res) => {
  res.json({
    name: 'Team Axiom Dementia Care Integration Backend',
    version: '1.0.0',
    status: 'online',
    endpoints: {
      health: '/api/health',
      initialAssessment: 'POST /api/assessment/initial',
      recommendation: 'GET /api/recommendation/:patientId',
      recordSession: 'POST /api/sessions/record',
      assistant: 'POST /api/assistant/query',
      patient: 'GET /api/patients/:patientId',
    },
  });
});

export default app;
