import dotEnv from 'dotenv'; // Import dotenv to load environment variables

/**
 * Load environment variables based on the current NODE_ENV.
 * 
 * - Loads from `.env.[NODE_ENV]` file if not in production
 * - Loads from default `.env` file if in production
 */

// Determine if the environment is production
const isProduction = process.env.NODE_ENV === 'prod';

if (!isProduction) {
  // Construct the path for the appropriate .env file (e.g., .env.dev, .env.staging)
  const configFile = `./.env.${process.env.NODE_ENV}`;

  // Load variables from the specified .env.[env] file
  dotEnv.config({ path: configFile });
  console.log(`Loaded environment variables from ${configFile}`);
} else {
  // Load from default .env file (used in production)
  dotEnv.config();
  console.log('Loaded environment variables from default .env file');
}
