import type { Route } from "./+types/home";
import { Hero } from "../components/Hero";
import { ProductGrid } from "../components/ProductGrid";
import { Features } from "../components/Features";
import { Newsletter } from "../components/Newsletter";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Store | Minimal Modern Storefront" },
    { name: "description", content: "Discover our curated collection of premium products designed with simplicity and functionality in mind." },
  ];
}

export default function Home() {
  return (
    <>
      <Hero />
      <ProductGrid />
      <Features />
      <Newsletter />
    </>
  );
}
