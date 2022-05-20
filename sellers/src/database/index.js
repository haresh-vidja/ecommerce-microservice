// Entry point for initializing database connections

import { init as mongoInit } from './mongo/index.js';   // MongoDB initialization
import { init as mySqlInit } from './mysql/index.js';   // MySQL (Sequelize) initialization

export {
  mongoInit,
  mySqlInit
};
