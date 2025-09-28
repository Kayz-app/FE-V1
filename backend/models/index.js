const { sequelize } = require('../config/database');

// Import all models
const User = require('./User');
const Project = require('./Project');
const Portfolio = require('./Portfolio');
const MarketListing = require('./MarketListing');
const KycDocument = require('./KycDocument');

// Define model associations
User.hasMany(Project, { foreignKey: 'developerId', as: 'projects' });
Project.belongsTo(User, { foreignKey: 'developerId', as: 'developer' });

User.hasOne(Portfolio, { foreignKey: 'userId', as: 'portfolio' });
Portfolio.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(MarketListing, { foreignKey: 'sellerId', as: 'listings' });
MarketListing.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });

User.hasMany(MarketListing, { foreignKey: 'buyerId', as: 'purchases' });
MarketListing.belongsTo(User, { foreignKey: 'buyerId', as: 'buyer' });

Project.hasMany(MarketListing, { foreignKey: 'projectId', as: 'listings' });
MarketListing.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

User.hasMany(KycDocument, { foreignKey: 'userId', as: 'kycDocuments' });
KycDocument.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(KycDocument, { foreignKey: 'reviewedBy', as: 'reviewedDocuments' });
KycDocument.belongsTo(User, { foreignKey: 'reviewedBy', as: 'reviewer' });

module.exports = {
  sequelize,
  User,
  Project,
  Portfolio,
  MarketListing,
  KycDocument
};
