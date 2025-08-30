export function Categories() {
  const categories = [
    {
      id: 1,
      name: "Clothing",
      description: "Premium apparel for all occasions",
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=600&auto=format&fit=crop&bg=transparent",
      href: "/products?category=clothing"
    },
    {
      id: 2,
      name: "Shoes",
      description: "Comfortable and stylish footwear",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=600&auto=format&fit=crop&bg=transparent",
      href: "/products?category=shoes"
    },
    {
      id: 3,
      name: "Accessories",
      description: "Perfect finishing touches",
      image: "https://images.unsplash.com/photo-1585155770447-2f66e2a397b5?w=800&h=600&auto=format&fit=crop&bg=transparent",
      href: "/products?category=accessories"
    },
    {
      id: 4,
      name: "Home Goods",
      description: "Elevate your living space",
      image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&h=600&auto=format&fit=crop&bg=transparent",
      href: "/products?category=home"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900">Shop by Category</h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Browse our collection organized by categories to find exactly what you're looking for.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <a 
              key={category.id} 
              href={category.href}
              className="group block"
            >
              <div className="aspect-square overflow-hidden rounded-lg mb-4">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover object-center group-hover:opacity-80 transition"
                />
              </div>
              <h3 className="text-lg font-medium text-gray-900 group-hover:text-gray-700">
                {category.name}
              </h3>
              <p className="text-gray-600 text-sm mt-1">
                {category.description}
              </p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}