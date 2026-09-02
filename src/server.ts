import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { apiRouter } from './routes/api';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for Frontend (port 5173, localhost, etc.)
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
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

// Start listening if run directly
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Team Axiom Backend running at: http://localhost:${PORT}`);
    console.log(`📡 Connected to Axiom AI Service: ${process.env.AI_SERVICE_URL || 'http://localhost:8000'}`);
    console.log(`=======================================================`);
  });
}

export default app;
