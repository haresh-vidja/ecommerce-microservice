import dotenv from 'dotenv'; // Load environment variables from .env files

// Determine the active environment
const env = process.env.NODE_ENV || 'development';

if (env !== 'prod') {
  // Load from .env.{env} (e.g., .env.development, .env.staging)
  const configPath = `./.env.${env}`;
  dotenv.config({ path: configPath });
  console.log(`Loaded environment from ${configPath}`);
} else {
  // Load default .env in production
  dotenv.config();
  console.log('Loaded environment from default .env (production mode)');
}
