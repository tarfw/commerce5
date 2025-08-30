export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

export const products: Product[] = [
  {
    id: 1,
    name: "Classic White T-Shirt",
    description: "Premium organic cotton t-shirt with a relaxed fit and timeless design.",
    price: 29,
    image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&h=800&auto=format&fit=crop&bg=transparent",
    category: "Clothing"
  },
  {
    id: 2,
    name: "Black Hoodie",
    description: "Comfortable cotton blend hoodie with kangaroo pocket and drawstring hood.",
    price: 59,
    image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&h=800&auto=format&fit=crop&bg=transparent",
    category: "Clothing"
  },
  {
    id: 3,
    name: "Running Sneakers",
    description: "Lightweight athletic shoes with breathable mesh and cushioned sole.",
    price: 89,
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&h=800&auto=format&fit=crop&bg=transparent",
    category: "Shoes"
  },
  {
    id: 4,
    name: "Casual Jeans",
    description: "Classic straight-leg denim jeans with comfortable stretch fabric.",
    price: 79,
    image: "https://images.unsplash.com/photo-1604176354204-9268737828e4?w=800&h=800&auto=format&fit=crop&bg=transparent",
    category: "Clothing"
  },
  {
    id: 5,
    name: "Canvas Sneakers",
    description: "Vintage-style canvas shoes perfect for everyday casual wear.",
    price: 45,
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=800&auto=format&fit=crop&bg=transparent",
    category: "Shoes"
  },
  {
    id: 6,
    name: "Polo Shirt",
    description: "Classic polo shirt in soft cotton pique with ribbed collar and cuffs.",
    price: 39,
    image: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=800&h=800&auto=format&fit=crop&bg=transparent",
    category: "Clothing"
  },
  {
    id: 7,
    name: "Leather Boots",
    description: "Durable leather boots with non-slip sole and comfortable ankle support.",
    price: 129,
    image: "https://images.unsplash.com/photo-1608256246200-53e8b47b2dc1?w=800&h=800&auto=format&fit=crop&bg=transparent",
    category: "Shoes"
  },
  {
    id: 8,
    name: "Summer Dress",
    description: "Lightweight cotton dress with floral print and comfortable fit.",
    price: 69,
    image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&h=800&auto=format&fit=crop&bg=transparent",
    category: "Clothing"
  },
  {
    id: 9,
    name: "Sports Jacket",
    description: "Water-resistant windbreaker perfect for outdoor activities.",
    price: 99,
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=800&auto=format&fit=crop&bg=transparent",
    category: "Clothing"
  },
  {
    id: 10,
    name: "High-Top Sneakers",
    description: "Classic high-top sneakers with durable canvas upper and rubber sole.",
    price: 65,
    image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&h=800&auto=format&fit=crop&bg=transparent",
    category: "Shoes"
  }
];