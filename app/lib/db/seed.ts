// app/lib/db/seed.ts
import { initializeDatabase } from "./client";
import { initializeProducts } from "./products";
import { createSection } from "./sections";
import { stringifySectionContent } from "../section-utils";

async function seedDatabase() {
  // Initialize the database schema
  await initializeDatabase();
  
  // Initialize products
  await initializeProducts();
  
  // Check if sections already exist
  // For simplicity, we'll just try to create them
  // In a real app, you'd want a more sophisticated check
  
  // Create sample hero section
  await createSection({
    page_type: "home",
    section_type: "hero",
    section_name: "Main Hero",
    layout_variant: "default",
    order_index: 0,
    is_active: true,
    version: 1,
    generated_content: stringifySectionContent({
      headline: "Minimal Design, Maximum Impact",
      subheadline: "Discover our curated collection of premium products designed with simplicity and functionality in mind.",
      features: [
        "Free shipping on orders over $50",
        "30-day return policy",
        "24/7 customer support"
      ],
      ctaPrimary: {
        text: "Shop Collection",
        action: "/products"
      },
      ctaSecondary: {
        text: "Learn More",
        action: "/about"
      }
    })
  });
  
  // Create sample categories section
  await createSection({
    page_type: "home",
    section_type: "categories",
    section_name: "Product Categories",
    layout_variant: "default",
    order_index: 1,
    is_active: true,
    version: 1,
    generated_content: stringifySectionContent({
      title: "Shop by Category",
      description: "Browse our carefully curated collections"
    })
  });
  
  // Create sample product showcase section
  await createSection({
    page_type: "home",
    section_type: "product_showcase",
    section_name: "Featured Products",
    layout_variant: "default",
    order_index: 2,
    is_active: true,
    version: 1,
    generated_content: stringifySectionContent({
      title: "Featured Products",
      description: "Our most popular items"
    })
  });
  
  // Create sample promotional banner section
  await createSection({
    page_type: "home",
    section_type: "cta",
    section_name: "Summer Sale",
    layout_variant: "default",
    order_index: 3,
    is_active: true,
    version: 1,
    generated_content: stringifySectionContent({
      title: "Summer Sale - Up to 50% Off",
      description: "Limited time offer on selected items",
      ctaPrimary: {
        text: "Shop Now",
        action: "/products"
      }
    })
  });
  
  // Create sample features section
  await createSection({
    page_type: "home",
    section_type: "features",
    section_name: "Our Features",
    layout_variant: "default",
    order_index: 4,
    is_active: true,
    version: 1,
    generated_content: stringifySectionContent({
      title: "Why Choose Us",
      description: "We're committed to providing the best shopping experience",
      features: [
        {
          title: "Fast Shipping",
          description: "Free shipping on orders over $50, with delivery in 2-3 business days",
          icon: "🚚"
        },
        {
          title: "Easy Returns",
          description: "30-day return policy with free return shipping",
          icon: "↩️"
        },
        {
          title: "Quality Guarantee",
          description: "All products come with a 1-year quality guarantee",
          icon: "✅"
        }
      ]
    })
  });
  
  // Create sample testimonials section
  await createSection({
    page_type: "home",
    section_type: "testimonials",
    section_name: "Customer Reviews",
    layout_variant: "default",
    order_index: 5,
    is_active: true,
    version: 1,
    generated_content: stringifySectionContent({
      title: "What Our Customers Say",
      description: "Don't just take our word for it - hear from our satisfied customers",
      testimonials: [
        {
          content: "The quality of these products exceeded my expectations. I'll definitely be ordering again!",
          author: "Sarah Johnson",
          role: "Customer",
          rating: 5
        },
        {
          content: "Fast shipping and excellent customer service. The product arrived in perfect condition.",
          author: "Michael Chen",
          role: "Customer",
          rating: 5
        },
        {
          content: "I've purchased several items and have been impressed with the quality and design of each one.",
          author: "Emma Rodriguez",
          role: "Customer",
          rating: 4
        }
      ]
    })
  });
  
  // Create sample about section
  await createSection({
    page_type: "home",
    section_type: "about_story",
    section_name: "Our Story",
    layout_variant: "default",
    order_index: 6,
    is_active: true,
    version: 1,
    generated_content: stringifySectionContent({
      title: "Our Story",
      subtitle: "Crafted with passion and attention to detail",
      description: "Founded in 2020, our mission has been to provide high-quality, thoughtfully designed products that enhance everyday life. We believe in simplicity, functionality, and sustainability.\n\nEach item in our collection is carefully selected and tested to ensure it meets our standards for quality and design. We work directly with manufacturers who share our values and commitment to ethical production."
    })
  });
  
  // Create sample newsletter section
  await createSection({
    page_type: "home",
    section_type: "newsletter",
    section_name: "Stay Updated",
    layout_variant: "default",
    order_index: 7,
    is_active: true,
    version: 1,
    generated_content: stringifySectionContent({
      title: "Stay Updated",
      description: "Subscribe to our newsletter for the latest updates, offers, and style inspiration",
      placeholder: "Enter your email",
      buttonText: "Subscribe",
      privacyText: "We respect your privacy. Unsubscribe at any time."
    })
  });
  
  console.log("Database seeded successfully!");
}

// Run the seed function
seedDatabase().catch(console.error);