/**
 * Base URLs for internal service-to-service communication.
 * Use environment-specific overrides for production deployment.
 */
export default {
  customer_service: "http://localhost:8001",  // Customer Service API
  product_service: "http://localhost:8002",   // Product Service API
  seller_service: "http://localhost:8003"     // Seller Service API
};
