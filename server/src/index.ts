import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes/api';
import { iotSimulator } from './services/iotSimulator';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: '*', // Allow frontend dev server
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Server health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    system: 'AquaSense Backend API',
    mode: 'Simulated IoT (Academic EVS Prototype)',
    timestamp: new Date(),
  });
});

// API Routes
app.use('/api', apiRouter);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred',
  });
});

// Start Server
const server = app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🌊 AquaSense REST API active at http://localhost:${PORT}`);
  console.log(`📡 Simulated IoT Engine ready`);
  console.log(`🌿 Environmental Studies Academic Water Monitor`);
  console.log(`=======================================================`);

  // Start periodic simulated IoT sensor telemetry
  iotSimulator.start();
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  iotSimulator.stop();
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  iotSimulator.stop();
  server.close(() => process.exit(0));
});

export default app;
