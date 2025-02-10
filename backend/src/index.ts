import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import eventRoutes from './routes/events';
import { closeDb } from './db';
import { ZodError } from 'zod';

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/events', eventRoutes);

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'healthy' });
});

interface ValidationError {
  issues: Array<{ message: string; path: string[] }>;
}

// Error handling for Zod validation
app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (err && typeof err === 'object' && 'issues' in err) {
    const validationError = err as ValidationError;
    return res.status(400).json({
      error: 'Validation error',
      details: validationError.issues
    });
  }
  next(err);
});

// Generic error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

async function handleShutdown(signal: string) {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  // Close server first (stop accepting new requests)
  server.close(() => {
    console.log('HTTP server closed');
  });

  try {
    // Close database connections
    await closeDb();
    console.log('Database connections closed');
    
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
}
