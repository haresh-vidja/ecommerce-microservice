/**
 * Microservice base URLs for inter-service communication.
 * These should ideally be environment-driven in production.
 */
export default {
  customer_service: "http://localhost:8001", // Base URL for Customer Service
  product_service: "http://localhost:8002",  // Base URL for Product Service
  seller_service: "http://localhost:8003"    // Base URL for Seller Service
};
