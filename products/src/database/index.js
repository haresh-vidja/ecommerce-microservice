import { init as mongoInit } from './mongo/index.js';  // Initialize the mongodb database
import { init as mySqlInit } from './mysql/index.js';  // Initialize the mysql database

export {
    mongoInit,
    mySqlInit
};