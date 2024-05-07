const config = require('../../config');
const providers = config.providers;
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const moment = require('moment');

module.exports = function (sequelize, DataTypes) {
  const proposals = sequelize.define(
    'proposals',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      title: {
        type: DataTypes.TEXT,
      },

      date_created: {
        type: DataTypes.DATE,
      },

      date_sent: {
        type: DataTypes.DATE,
      },

      status: {
        type: DataTypes.ENUM,

        values: ['draft', 'sent', 'signed'],
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

  proposals.associate = (db) => {
    /// loop through entities and it's fields, and if ref === current e[name] and create relation has many on parent entity

    //end loop

    db.proposals.belongsTo(db.leads, {
      as: 'lead',
      foreignKey: {
        name: 'leadId',
      },
      constraints: false,
    });

    db.proposals.hasMany(db.file, {
      as: 'document',
      foreignKey: 'belongsToId',
      constraints: false,
      scope: {
        belongsTo: db.proposals.getTableName(),
        belongsToColumn: 'document',
      },
    });

    db.proposals.belongsTo(db.users, {
      as: 'createdBy',
    });

    db.proposals.belongsTo(db.users, {
      as: 'updatedBy',
    });
  };

  return proposals;
};
