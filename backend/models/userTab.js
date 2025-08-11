import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

// user_tabs table definition
const UserTab = sequelize.define('UserTab', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  tab_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  acquired_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'user_tabs',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'tab_id'],
    },
  ],
});

export default UserTab;
