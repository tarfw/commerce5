import { Link } from "react-router";
import { products } from "../data/products";

export function ProductGrid() {
  // Use only the first 6 products for the homepage grid
  const featuredProducts = products.slice(0, 6);

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Discover our carefully curated selection of premium products designed for quality and style.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProducts.map((product) => (
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
                  </div>
                  <p className="text-lg font-medium text-gray-900">${product.price}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Link 
            to="/products" 
            className="inline-block border border-gray-900 text-gray-900 px-8 py-3 font-medium hover:bg-gray-50 transition"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
}