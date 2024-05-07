const config = require('../../config');
const providers = config.providers;
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const moment = require('moment');

module.exports = function (sequelize, DataTypes) {
  const tasks = sequelize.define(
    'tasks',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      description: {
        type: DataTypes.TEXT,
      },

      due_date: {
        type: DataTypes.DATE,
      },

      priority: {
        type: DataTypes.ENUM,

        values: ['low', 'medium', 'high'],
      },

      status: {
        type: DataTypes.ENUM,

        values: ['pending', 'in_progress', 'completed'],
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

  tasks.associate = (db) => {
    /// loop through entities and it's fields, and if ref === current e[name] and create relation has many on parent entity

    //end loop

    db.tasks.belongsTo(db.users, {
      as: 'assigned_to',
      foreignKey: {
        name: 'assigned_toId',
      },
      constraints: false,
    });

    db.tasks.belongsTo(db.users, {
      as: 'createdBy',
    });

    db.tasks.belongsTo(db.users, {
      as: 'updatedBy',
    });
  };

  return tasks;
};
