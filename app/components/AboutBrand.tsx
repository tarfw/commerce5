export function AboutBrand() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2">
            <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&auto=format&fit=crop&bg=transparent"
                alt="Our brand story"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="lg:w-1/2">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
            <p className="text-gray-600 mb-6">
              Founded in 2015, our brand began with a simple mission: to create high-quality, 
              minimalist products that enhance everyday life. We believe that design should be 
              both beautiful and functional.
            </p>
            <p className="text-gray-600 mb-6">
              Every product in our collection is carefully curated and designed with sustainability 
              in mind. We work directly with ethical manufacturers who share our commitment to 
              quality and environmental responsibility.
            </p>
            <p className="text-gray-600 mb-8">
              Our team of designers and artisans work together to create timeless pieces that 
              transcend seasonal trends, ensuring that your purchase today will bring you joy 
              for years to come.
            </p>
            <a 
              href="/about" 
              className="inline-block border border-gray-900 text-gray-900 px-8 py-3 font-medium hover:bg-gray-50 transition"
            >
              Learn More About Us
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}