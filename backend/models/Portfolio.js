const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Portfolio = sequelize.define('Portfolio', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    field: 'user_id'
  },
  tokens: {
    type: DataTypes.JSON,
    defaultValue: [],
    validate: {
      isValidTokens(value) {
        if (!Array.isArray(value)) {
          throw new Error('Tokens must be an array');
        }
        value.forEach(token => {
          if (!token.tokenId || !token.projectId || !token.type || token.amount === undefined) {
            throw new Error('Each token must have tokenId, projectId, type, and amount');
          }
          if (!['SECURITY', 'MARKET'].includes(token.type)) {
            throw new Error('Token type must be SECURITY or MARKET');
          }
          if (!['held', 'listed', 'sold'].includes(token.status || 'held')) {
            throw new Error('Token status must be held, listed, or sold');
          }
        });
      }
    }
  },
  totalValue: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
    field: 'total_value'
  }
}, {
  tableName: 'portfolios',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Portfolio;