/**
 * Service endpoint configuration.
 * Use environment variables in production for better flexibility.
 */

export default {
  customerService: process.env.CUSTOMER_SERVICE_URL || "http://localhost:8001",
  productService: process.env.PRODUCT_SERVICE_URL || "http://localhost:8002",
  sellerService: process.env.SELLER_SERVICE_URL || "http://localhost:8003"
};