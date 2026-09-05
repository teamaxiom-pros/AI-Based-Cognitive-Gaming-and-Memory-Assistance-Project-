import app from './app';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Team Axiom Backend running at: http://localhost:${PORT}`);
  console.log(`📡 Connected to Axiom AI Service: ${process.env.AI_SERVICE_URL || 'http://localhost:8000'}`);
  console.log(`=======================================================`);
});

export default app;
