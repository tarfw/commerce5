import type { Route } from "./+types/products";
import { Newsletter } from "../../components/Newsletter";
import { products } from "../../data/products";
import { Link } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Products | Store" },
    { name: "description", content: "Browse our full collection of premium products." },
  ];
}

export default function Products() {
  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900">Our Collection</h1>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Discover our carefully curated selection of premium products designed for quality and style.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div key={product.id} className="group">
              <Link to={`/products/${product.id}`} className="block">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover object-center group-hover:opacity-80 transition"
                  />
                </div>
                <div className="mt-4 flex justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                    <p className="text-gray-600 text-sm">{product.category}</p>
                  </div>
                  <p className="text-lg font-medium text-gray-900">${product.price}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
      <Newsletter />
    </div>
  );
}