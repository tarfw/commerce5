import type { Route } from "./+types/about";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "About | Store" },
    { name: "description", content: "Learn about our brand and values." },
  ];
}

export default function About() {
  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">About Us</h1>
          
          <div className="prose prose-lg text-gray-600">
            <p>
              Founded with a passion for minimal design and exceptional quality, we create products that stand the test of time. 
              Our approach combines functionality with aesthetic simplicity, resulting in items that enhance everyday life.
            </p>
            
            <p className="mt-6">
              Each product in our collection is carefully selected for its craftsmanship, durability, and timeless appeal. 
              We believe in sustainability through quality - creating items that don't need to be replaced frequently, 
              reducing waste and providing long-term value to our customers.
            </p>
            
            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Our Philosophy</h2>
            
            <p>
              We adhere to the principle that good design is as little design as possible. 
              This doesn't mean our products are plain or boring - rather, every element serves a purpose, 
              and nothing is included without intention. The result is products that are both beautiful and functional.
            </p>
            
            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Sustainability</h2>
            
            <p>
              Environmental responsibility is at the core of our business. We work with suppliers who share our commitment 
              to ethical production and sustainable practices. From sourcing materials to packaging, we strive to minimize 
              our impact on the planet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}