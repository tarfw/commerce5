import type { Route } from "./+types/home";
import { Hero } from "../components/Hero";
import { ProductGrid } from "../components/ProductGrid";
import { Features } from "../components/Features";
import { Newsletter } from "../components/Newsletter";
import { Testimonials } from "../components/Testimonials";
import { Categories } from "../components/Categories";
import { PromotionalBanner } from "../components/PromotionalBanner";
import { AboutBrand } from "../components/AboutBrand";

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
      <Categories />
      <ProductGrid />
      <PromotionalBanner />
      <Features />
      <Testimonials />
      <AboutBrand />
      <Newsletter />
    </>
  );
}
