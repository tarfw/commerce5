export function PromotionalBanner() {
  return (
    <section className="py-16 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block bg-white text-gray-900 px-3 py-1 rounded-full text-sm font-medium mb-4">
            Limited Time Offer
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Summer Sale - Up to 50% Off
          </h2>
          <p className="text-gray-300 mb-8 text-lg">
            Refresh your wardrobe with our summer collection. Discount applies to all items in the summer collection.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <a 
              href="/products" 
              className="inline-block bg-white text-gray-900 px-8 py-4 text-center font-medium hover:bg-gray-100 transition"
            >
              Shop Now
            </a>
            <a 
              href="/about" 
              className="inline-block border border-white text-white px-8 py-4 text-center font-medium hover:bg-gray-800 transition"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}