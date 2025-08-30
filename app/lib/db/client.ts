// app/lib/db/client.ts
import { createClient } from "@libsql/client";
import { config } from "../env";

// Create the database client
export const db = createClient({
  url: config.database.url,
  authToken: config.database.authToken,
});

// Initialize the database schema
export async function initializeDatabase() {
  // Create ai_sections table for storing AI-generated sections
  await db.execute(`
    CREATE TABLE IF NOT EXISTS ai_sections (
      id TEXT PRIMARY KEY,
      page_type TEXT NOT NULL,
      section_type TEXT NOT NULL,
      section_name TEXT,
      ai_prompt TEXT,
      generated_content TEXT NOT NULL,
      layout_variant TEXT DEFAULT 'default',
      order_index INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      version INTEGER DEFAULT 1,
      generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes for better performance
  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_ai_sections_page_type 
    ON ai_sections(page_type, is_active, order_index)
  `);

  // Create products table (we'll migrate from the static data)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      image TEXT,
      category TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create categories table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      image TEXT,
      sort_order INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes for categories
  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_categories_slug 
    ON categories(slug, is_active)
  `);

  console.log("Database initialized successfully");
}