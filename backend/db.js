import { Sequelize } from 'sequelize';

// Initialize SQLite database using Sequelize
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite',
  logging: false,
});

export default sequelize;
export const initDb = async () => {
  await sequelize.authenticate();
  await sequelize.sync();
};
