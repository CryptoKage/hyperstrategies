import sequelize, { initDb } from '../db.js';
import UserTab from './userTab.js';

// Initialize database and models
export const initializeModels = async () => {
  await initDb();
};

export { sequelize, UserTab };
