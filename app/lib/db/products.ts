// app/lib/db/products.ts
import { db } from "./client";
import { products as staticProducts } from "../../data/products";

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  created_at?: string;
  updated_at?: string;
}

// Get all products
export async function getAllProducts(): Promise<Product[]> {
  const result = await db.execute({
    sql: "SELECT * FROM products ORDER BY id ASC",
    args: [],
  });

  return result.rows as unknown as Product[];
}

// Get product by ID
export async function getProductById(id: number): Promise<Product | null> {
  const result = await db.execute({
    sql: "SELECT * FROM products WHERE id = ?",
    args: [id],
  });

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0] as unknown as Product;
}

// Get products by category
export async function getProductsByCategory(category: string): Promise<Product[]> {
  const result = await db.execute({
    sql: "SELECT * FROM products WHERE category = ? ORDER BY id ASC",
    args: [category],
  });

  return result.rows as unknown as Product[];
}

// Get all categories
export async function getAllCategories(): Promise<{ id: number; name: string; slug: string; description?: string; image?: string }[]> {
  const result = await db.execute({
    sql: "SELECT * FROM categories ORDER BY sort_order ASC",
    args: [],
  });

  return result.rows as unknown as { id: number; name: string; slug: string; description?: string; image?: string }[];
}

// Initialize products from static data
export async function initializeProducts() {
  // Check if products already exist
  const result = await db.execute("SELECT COUNT(*) as count FROM products");
  const count = (result.rows[0] as any).count;

  if (count === 0) {
    // Insert static products into database
    for (const product of staticProducts) {
      await db.execute({
        sql: `
          INSERT INTO products (id, name, description, price, image, category)
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        args: [
          product.id,
          product.name,
          product.description,
          product.price,
          product.image,
          product.category,
        ],
      });
    }
    console.log(`Inserted ${staticProducts.length} products into database`);
  }

  // Check if categories exist
  const categoryResult = await db.execute("SELECT COUNT(*) as count FROM categories");
  const categoryCount = (categoryResult.rows[0] as any).count;

  if (categoryCount === 0) {
    // Get unique categories from products
    const categories = [...new Set(staticProducts.map(p => p.category))];
    
    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      const slug = category.toLowerCase().replace(/\s+/g, '-');
      
      await db.execute({
        sql: `
          INSERT INTO categories (id, name, slug, sort_order)
          VALUES (?, ?, ?, ?)
        `,
        args: [i + 1, category, slug, i],
      });
    }
    
    console.log(`Inserted ${categories.length} categories into database`);
  }
}