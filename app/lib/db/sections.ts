// app/lib/db/sections.ts
import { db } from "./client";

export interface AISection {
  id: string;
  page_type: string;
  section_type: string;
  section_name?: string;
  ai_prompt?: string;
  generated_content: string; // JSON string
  layout_variant: string;
  order_index: number;
  is_active: boolean;
  version: number;
  generated_at?: string;
  updated_at?: string;
}

// Get all active sections for a page type ordered by order_index
export async function getSectionsByPageType(pageType: string): Promise<AISection[]> {
  const result = await db.execute({
    sql: `
      SELECT * FROM ai_sections 
      WHERE page_type = ? AND is_active = true 
      ORDER BY order_index ASC
    `,
    args: [pageType],
  });

  // Convert is_active from number to boolean
  return result.rows.map(row => ({
    ...row,
    is_active: row.is_active === 1
  })) as unknown as AISection[];
}

// Get a specific section by ID
export async function getSectionById(id: string): Promise<AISection | null> {
  const result = await db.execute({
    sql: "SELECT * FROM ai_sections WHERE id = ?",
    args: [id],
  });

  if (result.rows.length === 0) {
    return null;
  }

  // Convert is_active from number to boolean
  const row = result.rows[0];
  return {
    ...row,
    is_active: row.is_active === 1
  } as unknown as AISection;
}

// Create a new section
export async function createSection(section: Omit<AISection, "id" | "generated_at" | "updated_at">): Promise<AISection> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  
  await db.execute({
    sql: `
      INSERT INTO ai_sections (
        id, page_type, section_type, section_name, ai_prompt, 
        generated_content, layout_variant, order_index, is_active, version, 
        generated_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      id,
      section.page_type,
      section.section_type,
      section.section_name || null,
      section.ai_prompt || null,
      section.generated_content,
      section.layout_variant,
      section.order_index,
      section.is_active ? 1 : 0,
      section.version,
      now,
      now,
    ],
  });

  return {
    ...section,
    id,
    generated_at: now,
    updated_at: now,
  };
}

// Update a section
export async function updateSection(id: string, updates: Partial<AISection>): Promise<void> {
  const fields: string[] = [];
  const args: any[] = [];
  
  for (const [key, value] of Object.entries(updates)) {
    if (key !== "id" && key !== "generated_at") {
      fields.push(`${key} = ?`);
      // Convert boolean to number for database storage
      if (typeof value === "boolean") {
        args.push(value ? 1 : 0);
      } else {
        args.push(value || null);
      }
    }
  }
  
  if (fields.length === 0) {
    return;
  }
  
  args.push(id);
  
  await db.execute({
    sql: `UPDATE ai_sections SET ${fields.join(", ")}, updated_at = ? WHERE id = ?`,
    args: [...args, new Date().toISOString(), id],
  });
}

// Delete a section
export async function deleteSection(id: string): Promise<void> {
  await db.execute({
    sql: "DELETE FROM ai_sections WHERE id = ?",
    args: [id],
  });
}