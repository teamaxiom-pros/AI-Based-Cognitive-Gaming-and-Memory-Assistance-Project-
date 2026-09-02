import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { apiRouter } from './routes/api';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for Frontend (development & production on Vercel)
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

// Request logging in development
app.use((req, _res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api', apiRouter);
app.use('/api/v1', apiRouter); // Alias for backwards compatibility

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

// Start listening only when run directly as standalone server (not in Vercel serverless, tests, or index imports)
const isMainModule =
  process.argv[1] &&
  (process.argv[1].endsWith('server.ts') ||
    process.argv[1].endsWith('server.js') ||
    process.env.STANDALONE_SERVER === 'true');

if (
  process.env.VERCEL !== '1' &&
  process.env.NODE_ENV !== 'test' &&
  isMainModule
) {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Team Axiom Backend running at: http://localhost:${PORT}`);
    console.log(`📡 Connected to Axiom AI Service: ${process.env.AI_SERVICE_URL || 'http://localhost:8000'}`);
    console.log(`=======================================================`);
  });
}

export default app;
