const config = require('../../config');
const providers = config.providers;
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const moment = require('moment');

module.exports = function (sequelize, DataTypes) {
  const leads = sequelize.define(
    'leads',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      name: {
        type: DataTypes.TEXT,
      },

      email: {
        type: DataTypes.TEXT,
      },

      phone_number: {
        type: DataTypes.TEXT,
      },

      status: {
        type: DataTypes.ENUM,

        values: ['new', 'contacted', 'qualified', 'lost'],
      },

      last_contacted: {
        type: DataTypes.DATE,
      },

      importHash: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
      },
    },
    {
      timestamps: true,
      paranoid: true,
      freezeTableName: true,
    },
  );

  leads.associate = (db) => {
    db.leads.belongsToMany(db.interactions, {
      as: 'interactions',
      foreignKey: {
        name: 'leads_interactionsId',
      },
      constraints: false,
      through: 'leadsInteractionsInteractions',
    });

    /// loop through entities and it's fields, and if ref === current e[name] and create relation has many on parent entity

    db.leads.hasMany(db.interactions, {
      as: 'interactions_lead',
      foreignKey: {
        name: 'leadId',
      },
      constraints: false,
    });

    db.leads.hasMany(db.proposals, {
      as: 'proposals_lead',
      foreignKey: {
        name: 'leadId',
      },
      constraints: false,
    });

    //end loop

    db.leads.belongsTo(db.users, {
      as: 'assigned_to',
      foreignKey: {
        name: 'assigned_toId',
      },
      constraints: false,
    });

    db.leads.belongsTo(db.users, {
      as: 'createdBy',
    });

    db.leads.belongsTo(db.users, {
      as: 'updatedBy',
    });
  };

  return leads;
};
