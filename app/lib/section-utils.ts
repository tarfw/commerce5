// app/lib/section-utils.ts
import type { AISection } from "./db/sections";

// Parse the generated_content JSON string into an object
export function parseSectionContent(section: AISection): any {
  try {
    return JSON.parse(section.generated_content);
  } catch (error) {
    console.error("Failed to parse section content:", error);
    return {};
  }
}

// Stringify section content object into JSON string
export function stringifySectionContent(content: any): string {
  try {
    return JSON.stringify(content);
  } catch (error) {
    console.error("Failed to stringify section content:", error);
    return "{}";
  }
}

// Section component mapping
export const SECTION_COMPONENTS: Record<string, string> = {
  hero: "Hero",
  features: "Features",
  testimonials: "Testimonials",
  product_showcase: "ProductGrid",
  cta: "PromotionalBanner",
  newsletter: "Newsletter",
  about_story: "AboutBrand",
  categories: "Categories",
};

// Get component name for a section type
export function getComponentForSection(sectionType: string): string {
  return SECTION_COMPONENTS[sectionType] || "UnknownSection";
}