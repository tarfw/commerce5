import type { Route } from "./+types/home";
import { useLoaderData } from "react-router";
import { AISection } from "../components/AISection";
import { getSectionsByPageType } from "../lib/db/sections";
import { getAllProducts, getAllCategories } from "../lib/db/products";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Store | Minimal Modern Storefront" },
    { name: "description", content: "Discover our curated collection of premium products designed with simplicity and functionality in mind." },
  ];
}

export async function loader() {
  // Get sections for the home page from the database
  const sections = await getSectionsByPageType("home");
  
  // Get products and categories for sections that need them
  const products = await getAllProducts();
  const categories = await getAllCategories();
  
  return { sections, products, categories };
}

export default function Home() {
  const { sections, products, categories } = useLoaderData<typeof loader>();
  
  return (
    <>
      {sections.map((section) => (
        <AISection 
          key={section.id} 
          section={section} 
          products={section.section_type === "product_showcase" ? products : undefined}
          categories={section.section_type === "categories" ? categories : undefined}
        />
      ))}
    </>
  );
}
