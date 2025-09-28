const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MarketListing = sequelize.define('MarketListing', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  listingId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    field: 'listing_id'
  },
  tokenId: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'token_id'
  },
  sellerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    field: 'seller_id'
  },
  projectId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'projects',
      key: 'id'
    },
    field: 'project_id'
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  price: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  status: {
    type: DataTypes.ENUM('active', 'sold', 'cancelled'),
    defaultValue: 'active'
  },
  soldAt: {
    type: DataTypes.DATE,
    field: 'sold_at'
  },
  buyerId: {
    type: DataTypes.UUID,
    references: {
      model: 'users',
      key: 'id'
    },
    field: 'buyer_id'
  }
}, {
  tableName: 'market_listings',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = MarketListing;