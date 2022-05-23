// Entry point for initializing database connections

const driver = process.env.DATABASE_DRIVER;

let dbConnect;

if (driver === 'mongodb') {
  const { init: mongoInit } = await import('./mongo/index.js');
  dbConnect = mongoInit;
} else if (driver === 'mysql') {
  const { init: mySqlInit } = await import('./mysql/index.js');
  dbConnect = mySqlInit;
} else {
  throw new Error(`Unsupported DATABASE_DRIVER: ${driver}`);
}

export { dbConnect };
