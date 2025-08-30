import type { Route } from "./+types/not-found";
import { Link } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Page Not Found | Store" },
    { name: "description", content: "The page you're looking for doesn't exist." },
  ];
}

export default function NotFound() {
  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900">404</h1>
          <h2 className="text-3xl font-bold text-gray-900 mt-4">Page Not Found</h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Sorry, we couldn't find the page you're looking for.
          </p>
          <div className="mt-10">
            <Link 
              to="/" 
              className="inline-block bg-gray-900 text-white px-8 py-4 rounded hover:bg-gray-800 transition mr-4"
            >
              Go Home
            </Link>
            <Link 
              to="/products" 
              className="inline-block border border-gray-900 text-gray-900 px-8 py-4 rounded hover:bg-gray-50 transition"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}