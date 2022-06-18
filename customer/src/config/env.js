import dotenv from "dotenv"; // Load environment variables from .env files
import fs from "fs";

/**
 * Load environment variables dynamically based on NODE_ENV.
 * Falls back to default `.env` if NODE_ENV is "prod" or not set.
 */
(() => {
  const env = process.env.NODE_ENV || "development"; // Default to 'development' if not set

  // For non-production environments, load from a specific .env file
  if (env !== "prod") {
    const configPath = `./.env.${env}`;

    // Check if the environment file exists
    if (fs.existsSync(configPath)) {
      dotenv.config({ path: configPath });
      console.log(`Loaded environment: ${configPath}`);
    } else {
      console.warn(`Environment file not found: ${configPath}. Loading default .env`);
      dotenv.config();
    }
  } else {
    // For production, use the default .env file
    dotenv.config();
    console.log("Loaded default .env (production mode)");
  }
})();
