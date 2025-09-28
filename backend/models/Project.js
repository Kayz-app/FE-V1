const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  tokenTicker: {
    type: DataTypes.STRING(3),
    allowNull: false,
    validate: {
      isUppercase: true,
      len: [1, 3]
    },
    field: 'token_ticker'
  },
  tokenSupply: {
    type: DataTypes.BIGINT,
    allowNull: false,
    validate: {
      min: 1
    },
    field: 'token_supply'
  },
  developerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    field: 'developer_id'
  },
  developerName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'developer_name'
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fundingGoal: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: {
      min: 1
    },
    field: 'funding_goal'
  },
  amountRaised: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
    field: 'amount_raised'
  },
  apy: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    validate: {
      min: 0,
      max: 100
    }
  },
  term: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  startDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'start_date'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  imageUrl: {
    type: DataTypes.STRING,
    field: 'image_url'
  },
  images: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  status: {
    type: DataTypes.ENUM('pending', 'active', 'funded', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  projectWalletBalance: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
    field: 'project_wallet_balance'
  },
  completionDate: {
    type: DataTypes.DATE,
    field: 'completion_date'
  },
  fundsWithdrawn: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'funds_withdrawn'
  },
  contractAddress: {
    type: DataTypes.STRING,
    unique: true,
    field: 'contract_address'
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {}
  }
}, {
  tableName: 'projects',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Project;