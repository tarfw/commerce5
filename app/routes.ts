import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("products", "routes/products/products.tsx"),
  route("products/:productId", "routes/products/product.tsx"),
  route("about", "routes/about.tsx"),
  route("contact", "routes/contact.tsx"),
  route("*", "routes/$.tsx")
] satisfies RouteConfig;
