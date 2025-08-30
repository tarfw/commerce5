import type { Route } from "./+types/product";
import { products } from "../../data/products";
import { Link } from "react-router";

export function meta({ params }: Route.MetaArgs) {
  const product = products.find(p => p.id === parseInt(params.productId));
  
  if (!product) {
    return [
      { title: "Product Not Found | Store" },
    ];
  }
  
  return [
    { title: `${product.name} | Store` },
    { name: "description", content: product.description },
  ];
}

export default function Product({ params }: Route.ComponentProps) {
  const product = products.find(p => p.id === parseInt(params.productId));
  
  if (!product) {
    return (
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Product Not Found</h1>
            <p className="mt-4 text-gray-600">The product you're looking for doesn't exist.</p>
            <Link 
              to="/products" 
              className="mt-8 inline-block bg-gray-900 text-white px-6 py-3 rounded hover:bg-gray-800 transition"
            >
              Back to Products
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <div className="aspect-square overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                <p className="mt-2 text-gray-600">{product.category}</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">${product.price}</p>
            </div>
            
            <p className="mt-6 text-gray-600">{product.description}</p>
            
            <div className="mt-10">
              <button className="w-full bg-gray-900 text-white px-8 py-4 rounded hover:bg-gray-800 transition">
                Add to Cart
              </button>
              
              <div className="mt-6 flex space-x-4">
                <button className="flex-1 border border-gray-300 text-gray-900 px-6 py-3 rounded hover:bg-gray-50 transition">
                  Add to Wishlist
                </button>
                <button className="flex-1 border border-gray-300 text-gray-900 px-6 py-3 rounded hover:bg-gray-50 transition">
                  Share
                </button>
              </div>
            </div>
            
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Details</h2>
              <ul className="mt-4 space-y-2 text-gray-600">
                <li className="flex">
                  <span className="w-32">Material</span>
                  <span>Premium</span>
                </li>
                <li className="flex">
                  <span className="w-32">Dimensions</span>
                  <span>Standard</span>
                </li>
                <li className="flex">
                  <span className="w-32">Care</span>
                  <span>Follow instructions</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}