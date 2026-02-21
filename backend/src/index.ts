import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Status endpoint (read-only)
app.get('/api/status', (_req, res) => {
  res.json({
    services: [
      { name: 'API', status: 'operational' },
      { name: 'Dashboard', status: 'operational' }
    ],
    lastUpdated: new Date().toISOString()
  });
});

app.listen(port, () => {
  console.log(`Mission Control Backend running on port ${port}`);
});
