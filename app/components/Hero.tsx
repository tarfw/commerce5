export function Hero() {
  return (
    <section className="bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            Minimal Design, Maximum Impact
          </h1>
          <p className="mt-6 text-lg text-gray-600">
            Discover our curated collection of premium products designed with simplicity and functionality in mind.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <a 
              href="/products" 
              className="inline-block bg-gray-900 text-white px-8 py-4 text-center font-medium hover:bg-gray-800 transition"
            >
              Shop Collection
            </a>
            <a 
              href="/about" 
              className="inline-block border border-gray-900 text-gray-900 px-8 py-4 text-center font-medium hover:bg-gray-50 transition"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}