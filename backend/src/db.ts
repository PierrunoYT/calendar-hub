import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

let dbConnection: Database | null = null;

export async function openDb() {
  try {
    if (dbConnection) {
      return dbConnection;
    }

    const db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database
    });

    // Ensure tables are created with proper indexes
    await db.exec(`
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        color TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes for frequently queried fields
      CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
      CREATE INDEX IF NOT EXISTS idx_events_end_date ON events(end_date);
    `);

    // Enable foreign keys
    await db.exec('PRAGMA foreign_keys = ON;');

    dbConnection = db;
    return db;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw new Error('Failed to initialize database');
  }
}

export async function closeDb() {
  try {
    if (dbConnection) {
      await dbConnection.close();
      dbConnection = null;
    }
  } catch (error) {
    console.error('Error closing database connection:', error);
    throw new Error('Failed to close database connection');
  }
}

// Graceful shutdown handler
process.on('SIGINT', async () => {
  try {
    await closeDb();
    process.exit(0);
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
}); 