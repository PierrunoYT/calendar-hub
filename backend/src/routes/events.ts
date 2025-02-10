import { Router, Request, Response, NextFunction } from 'express';
import { openDb } from '../db';
import { z } from 'zod';

const router = Router();

// Validation schemas
const eventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  description: z.string().optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/, 'Invalid date format'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/, 'Invalid date format'),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid color format').optional()
});

const dateParamsSchema = z.object({
  year: z.string().regex(/^\d{4}$/, 'Invalid year format'),
  month: z.string().regex(/^(0?[1-9]|1[0-2])$/, 'Invalid month format')
});

type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

// Error handler middleware
const asyncHandler = (fn: AsyncRequestHandler) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Get all events for a specific month
router.get('/:year/:month', asyncHandler(async (req: Request, res: Response) => {
  const { year, month } = dateParamsSchema.parse(req.params);
  const db = await openDb();
  
  const events = await db.all(`
    SELECT * FROM events 
    WHERE substr(start_date, 1, 7) = ? 
    ORDER BY start_date
  `, [`${year}-${month.padStart(2, '0')}`]);
  
  res.json(events);
}));

// Create a new event
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const eventData = eventSchema.parse(req.body);
  const db = await openDb();
  
  // Validate that end_date is after start_date
  if (new Date(eventData.end_date) <= new Date(eventData.start_date)) {
    return res.status(400).json({ 
      error: 'End date must be after start date' 
    });
  }
  
  const result = await db.run(`
    INSERT INTO events (title, description, start_date, end_date, color)
    VALUES (?, ?, ?, ?, ?)
  `, [
    eventData.title,
    eventData.description || null,
    eventData.start_date,
    eventData.end_date,
    eventData.color || '#1976d2'
  ]);
  
  const event = await db.get('SELECT * FROM events WHERE id = ?', result.lastID);
  res.status(201).json(event);
}));

// Update an event
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const eventData = eventSchema.parse(req.body);
  const db = await openDb();
  
  // Validate that end_date is after start_date
  if (new Date(eventData.end_date) <= new Date(eventData.start_date)) {
    return res.status(400).json({ 
      error: 'End date must be after start date' 
    });
  }
  
  const { id } = req.params;
  const existingEvent = await db.get('SELECT * FROM events WHERE id = ?', id);
  
  if (!existingEvent) {
    return res.status(404).json({ error: 'Event not found' });
  }
  
  await db.run(`
    UPDATE events 
    SET title = ?, description = ?, start_date = ?, end_date = ?, color = ?
    WHERE id = ?
  `, [
    eventData.title,
    eventData.description || null,
    eventData.start_date,
    eventData.end_date,
    eventData.color || '#1976d2',
    id
  ]);
  
  const updatedEvent = await db.get('SELECT * FROM events WHERE id = ?', id);
  res.json(updatedEvent);
}));

// Delete an event
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const db = await openDb();
  const { id } = req.params;
  
  const existingEvent = await db.get('SELECT * FROM events WHERE id = ?', id);
  
  if (!existingEvent) {
    return res.status(404).json({ error: 'Event not found' });
  }
  
  await db.run('DELETE FROM events WHERE id = ?', id);
  res.status(204).send();
}));

export default router; 