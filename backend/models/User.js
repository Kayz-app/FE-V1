const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [6, 255]
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  userType: {
    type: DataTypes.ENUM('investor', 'developer', 'admin'),
    allowNull: false
  },
  walletNgn: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
    field: 'wallet_ngn'
  },
  walletUsdt: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
    field: 'wallet_usdt'
  },
  walletUsdc: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
    field: 'wallet_usdc'
  },
  kycStatus: {
    type: DataTypes.ENUM('Not Submitted', 'Pending', 'Verified', 'Rejected'),
    defaultValue: 'Not Submitted',
    field: 'kyc_status'
  },
  twoFactorEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'two_factor_enabled'
  },
  companyName: {
    type: DataTypes.STRING,
    field: 'company_name'
  },
  companyRegNumber: {
    type: DataTypes.STRING,
    field: 'company_reg_number'
  },
  companyAddress: {
    type: DataTypes.TEXT,
    field: 'company_address'
  },
  companyWebsite: {
    type: DataTypes.STRING,
    field: 'company_website'
  },
  treasuryAddress: {
    type: DataTypes.STRING,
    field: 'treasury_address'
  },
  walletAddress: {
    type: DataTypes.STRING,
    field: 'wallet_address'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  lastLogin: {
    type: DataTypes.DATE,
    field: 'last_login'
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeSave: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Instance method to compare password
User.prototype.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = User;