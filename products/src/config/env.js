import dotEnv from "dotenv";  // Import dotenv for loading environment variables

// Load environment variables based on the current environment
if (process.env.NODE_ENV !== "prod") {
  // If NODE_ENV is not "prod", load environment variables from a specific file
  const configFile = `./.env.${process.env.NODE_ENV}`;  // Construct the path to the environment file
  dotEnv.config({ path: configFile });  // Load environment variables from the specified file
} else {
  // If NODE_ENV is "prod", load environment variables from default configuration
  dotEnv.config();  // Load environment variables from default .env file
}
