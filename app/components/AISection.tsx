// app/components/AISection.tsx
import { parseSectionContent } from "../lib/section-utils";
import { getAllProducts, getProductsByCategory } from "../lib/db/products";
import { getAllCategories } from "../lib/db/products";

interface AISectionProps {
  section: any; // AISection from database
  className?: string;
  products?: any[]; // For product showcase sections
  categories?: any[]; // For categories sections
}

export function AISection({ section, className = "", products = [], categories = [] }: AISectionProps) {
  const content = parseSectionContent(section);
  
  // Render different sections based on section_type
  switch (section.section_type) {
    case "hero":
      return <AIHeroSection content={content} className={className} />;
    case "features":
      return <AIFeaturesSection content={content} className={className} />;
    case "testimonials":
      return <AITestimonialsSection content={content} className={className} />;
    case "product_showcase":
      return <AIProductShowcaseSection content={content} products={products} className={className} />;
    case "cta":
      return <AICTASection content={content} className={className} />;
    case "newsletter":
      return <AINewsletterSection content={content} className={className} />;
    case "about_story":
      return <AIAboutSection content={content} className={className} />;
    case "categories":
      return <AICategoriesSection content={content} categories={categories} className={className} />;
    default:
      return (
        <div className={`p-8 bg-gray-100 text-center ${className}`}>
          <p>Unknown section type: {section.section_type}</p>
        </div>
      );
  }
}

// Hero section component
function AIHeroSection({ content, className = "" }: { content: any; className?: string }) {
  return (
    <section className={`bg-white ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            {content.headline || "Default Headline"}
          </h1>
          <p className="mt-6 text-lg text-gray-600">
            {content.subheadline || "Default subheadline text"}
          </p>
          {content.features && content.features.length > 0 && (
            <ul className="mt-6 space-y-2">
              {content.features.map((feature: string, index: number) => (
                <li key={index} className="flex items-center">
                  <span className="mr-2">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-10 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            {content.ctaPrimary && (
              <a
                href={content.ctaPrimary.action || "#"}
                className="inline-block bg-gray-900 text-white px-8 py-4 text-center font-medium hover:bg-gray-800 transition"
                target={content.ctaPrimary.openInNewTab ? "_blank" : "_self"}
              >
                {content.ctaPrimary.text || "Primary CTA"}
              </a>
            )}
            {content.ctaSecondary && (
              <a
                href={content.ctaSecondary.action || "#"}
                className="inline-block border border-gray-900 text-gray-900 px-8 py-4 text-center font-medium hover:bg-gray-50 transition"
                target={content.ctaSecondary.openInNewTab ? "_blank" : "_self"}
              >
                {content.ctaSecondary.text || "Secondary CTA"}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// Features section component
function AIFeaturesSection({ content, className = "" }: { content: any; className?: string }) {
  return (
    <section className={`py-16 bg-gray-50 ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {content.title || "Our Features"}
          </h2>
          {content.description && (
            <p className="text-lg text-gray-600">
              {content.description}
            </p>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {content.features?.map((feature: any, index: number) => (
            <div key={index} className="bg-white p-8 rounded-lg shadow-sm">
              {feature.icon && (
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                  <span className="text-xl">{feature.icon}</span>
                </div>
              )}
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title || `Feature ${index + 1}`}
              </h3>
              <p className="text-gray-600">
                {feature.description || "Feature description"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Testimonials section component
function AITestimonialsSection({ content, className = "" }: { content: any; className?: string }) {
  return (
    <section className={`py-16 bg-white ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {content.title || "What Our Customers Say"}
          </h2>
          {content.description && (
            <p className="text-lg text-gray-600">
              {content.description}
            </p>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {content.testimonials?.map((testimonial: any, index: number) => (
            <div key={index} className="bg-gray-50 p-8 rounded-lg">
              <div className="flex items-center mb-6">
                {[...Array(testimonial.rating || 5)].map((_, i) => (
                  <span key={i} className="text-yellow-400">★</span>
                ))}
              </div>
              <p className="text-gray-600 italic mb-6">
                "{testimonial.content || "Testimonial content"}"
              </p>
              <div className="flex items-center">
                {testimonial.avatar && (
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.author} 
                    className="w-12 h-12 rounded-full mr-4"
                  />
                )}
                <div>
                  <p className="font-semibold text-gray-900">
                    {testimonial.author || "Author Name"}
                  </p>
                  {testimonial.role && (
                    <p className="text-gray-600 text-sm">
                      {testimonial.role}
                      {testimonial.company && `, ${testimonial.company}`}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Product showcase section component
function AIProductShowcaseSection({ content, products = [], className = "" }: { content: any; products: any[]; className?: string }) {
  return (
    <section className={`py-16 bg-white ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {content.title || "Featured Products"}
          </h2>
          {content.description && (
            <p className="text-lg text-gray-600">
              {content.description}
            </p>
          )}
        </div>
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <div key={product.id} className="group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:opacity-75 transition"
                  />
                </div>
                <h3 className="font-medium text-gray-900">{product.name}</h3>
                <p className="text-gray-500">${product.price}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No products available</p>
          </div>
        )}
      </div>
    </section>
  );
}

// CTA section component
function AICTASection({ content, className = "" }: { content: any; className?: string }) {
  return (
    <section className={`py-16 bg-gray-900 text-white ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          {content.title || "Ready to get started?"}
        </h2>
        {content.description && (
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
            {content.description}
          </p>
        )}
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          {content.ctaPrimary && (
            <a
              href={content.ctaPrimary.action || "#"}
              className="inline-block bg-white text-gray-900 px-8 py-4 text-center font-medium hover:bg-gray-100 transition"
              target={content.ctaPrimary.openInNewTab ? "_blank" : "_self"}
            >
              {content.ctaPrimary.text || "Get Started"}
            </a>
          )}
          {content.ctaSecondary && (
            <a
              href={content.ctaSecondary.action || "#"}
              className="inline-block border border-white text-white px-8 py-4 text-center font-medium hover:bg-white hover:text-gray-900 transition"
              target={content.ctaSecondary.openInNewTab ? "_blank" : "_self"}
            >
              {content.ctaSecondary.text || "Learn More"}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

// Newsletter section component
function AINewsletterSection({ content, className = "" }: { content: any; className?: string }) {
  return (
    <section className={`py-16 bg-white ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {content.title || "Stay Updated"}
          </h2>
          {content.description && (
            <p className="text-lg text-gray-600 mb-8">
              {content.description}
            </p>
          )}
          <form className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
            <input
              type="email"
              placeholder={content.placeholder || "Enter your email"}
              className="flex-grow px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition"
            >
              {content.buttonText || "Subscribe"}
            </button>
          </form>
          {content.privacyText && (
            <p className="text-sm text-gray-500 mt-4">
              {content.privacyText}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

// About section component
function AIAboutSection({ content, className = "" }: { content: any; className?: string }) {
  return (
    <section className={`py-16 bg-gray-50 ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {content.title || "Our Story"}
            </h2>
            {content.subtitle && (
              <p className="text-xl text-gray-600">
                {content.subtitle}
              </p>
            )}
          </div>
          <div className="prose prose-lg max-w-none">
            {content.description && (
              <p className="text-gray-600">
                {content.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// Categories section component
function AICategoriesSection({ content, categories = [], className = "" }: { content: any; categories: any[]; className?: string }) {
  return (
    <section className={`py-16 bg-white ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {content.title || "Shop by Category"}
          </h2>
          {content.description && (
            <p className="text-lg text-gray-600">
              {content.description}
            </p>
          )}
        </div>
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((category) => (
              <a 
                key={category.id} 
                href={`/products?category=${category.slug}`}
                className="group block"
              >
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                  {category.image ? (
                    <img 
                      src={category.image} 
                      alt={category.name} 
                      className="w-full h-full object-cover group-hover:opacity-75 transition"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span className="text-4xl">📁</span>
                    </div>
                  )}
                </div>
                <h3 className="text-center font-medium text-gray-900">{category.name}</h3>
              </a>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No categories available</p>
          </div>
        )}
      </div>
    </section>
  );
}