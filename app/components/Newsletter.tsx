export function Newsletter() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900">Stay in the Loop</h2>
          <p className="mt-4 text-gray-600">
            Subscribe to our newsletter for product updates, exclusive offers, and more.
          </p>
          <form className="mt-8 flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent flex-grow bg-white"
            />
            <button 
              type="submit"
              className="bg-gray-900 text-white px-6 py-3 rounded hover:bg-gray-800 transition whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}