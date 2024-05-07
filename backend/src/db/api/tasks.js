const db = require('../models');
const FileDBApi = require('./file');
const crypto = require('crypto');
const Utils = require('../utils');

const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

module.exports = class TasksDBApi {
  static async create(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const tasks = await db.tasks.create(
      {
        id: data.id || undefined,

        description: data.description || null,
        due_date: data.due_date || null,
        priority: data.priority || null,
        status: data.status || null,
        importHash: data.importHash || null,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await tasks.setAssigned_to(data.assigned_to || null, {
      transaction,
    });

    return tasks;
  }

  static async bulkImport(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    // Prepare data - wrapping individual data transformations in a map() method
    const tasksData = data.map((item, index) => ({
      id: item.id || undefined,

      description: item.description || null,
      due_date: item.due_date || null,
      priority: item.priority || null,
      status: item.status || null,
      importHash: item.importHash || null,
      createdById: currentUser.id,
      updatedById: currentUser.id,
      createdAt: new Date(Date.now() + index * 1000),
    }));

    // Bulk create items
    const tasks = await db.tasks.bulkCreate(tasksData, { transaction });

    // For each item created, replace relation files

    return tasks;
  }

  static async update(id, data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const tasks = await db.tasks.findByPk(id, {}, { transaction });

    await tasks.update(
      {
        description: data.description || null,
        due_date: data.due_date || null,
        priority: data.priority || null,
        status: data.status || null,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await tasks.setAssigned_to(data.assigned_to || null, {
      transaction,
    });

    return tasks;
  }

  static async remove(id, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const tasks = await db.tasks.findByPk(id, options);

    await tasks.update(
      {
        deletedBy: currentUser.id,
      },
      {
        transaction,
      },
    );

    await tasks.destroy({
      transaction,
    });

    return tasks;
  }

  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const tasks = await db.tasks.findOne({ where }, { transaction });

    if (!tasks) {
      return tasks;
    }

    const output = tasks.get({ plain: true });

    output.assigned_to = await tasks.getAssigned_to({
      transaction,
    });

    return output;
  }

  static async findAll(filter, options) {
    var limit = filter.limit || 0;
    var offset = 0;
    const currentPage = +filter.page;

    offset = currentPage * limit;

    var orderBy = null;

    const transaction = (options && options.transaction) || undefined;
    let where = {};
    let include = [
      {
        model: db.users,
        as: 'assigned_to',
      },
    ];

    if (filter) {
      if (filter.id) {
        where = {
          ...where,
          ['id']: Utils.uuid(filter.id),
        };
      }

      if (filter.description) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('tasks', 'description', filter.description),
        };
      }

      if (filter.due_dateRange) {
        const [start, end] = filter.due_dateRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            due_date: {
              ...where.due_date,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            due_date: {
              ...where.due_date,
              [Op.lte]: end,
            },
          };
        }
      }

      if (
        filter.active === true ||
        filter.active === 'true' ||
        filter.active === false ||
        filter.active === 'false'
      ) {
        where = {
          ...where,
          active: filter.active === true || filter.active === 'true',
        };
      }

      if (filter.priority) {
        where = {
          ...where,
          priority: filter.priority,
        };
      }

      if (filter.status) {
        where = {
          ...where,
          status: filter.status,
        };
      }

      if (filter.assigned_to) {
        var listItems = filter.assigned_to.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          assigned_toId: { [Op.or]: listItems },
        };
      }

      if (filter.createdAtRange) {
        const [start, end] = filter.createdAtRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            ['createdAt']: {
              ...where.createdAt,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            ['createdAt']: {
              ...where.createdAt,
              [Op.lte]: end,
            },
          };
        }
      }
    }

    let { rows, count } = options?.countOnly
      ? {
          rows: [],
          count: await db.tasks.count({
            where,
            include,
            distinct: true,
            limit: limit ? Number(limit) : undefined,
            offset: offset ? Number(offset) : undefined,
            order:
              filter.field && filter.sort
                ? [[filter.field, filter.sort]]
                : [['createdAt', 'desc']],
            transaction,
          }),
        }
      : await db.tasks.findAndCountAll({
          where,
          include,
          distinct: true,
          limit: limit ? Number(limit) : undefined,
          offset: offset ? Number(offset) : undefined,
          order:
            filter.field && filter.sort
              ? [[filter.field, filter.sort]]
              : [['createdAt', 'desc']],
          transaction,
        });

    //    rows = await this._fillWithRelationsAndFilesForRows(
    //      rows,
    //      options,
    //    );

    return { rows, count };
  }

  static async findAllAutocomplete(query, limit) {
    let where = {};

    if (query) {
      where = {
        [Op.or]: [
          { ['id']: Utils.uuid(query) },
          Utils.ilike('tasks', 'description', query),
        ],
      };
    }

    const records = await db.tasks.findAll({
      attributes: ['id', 'description'],
      where,
      limit: limit ? Number(limit) : undefined,
      orderBy: [['description', 'ASC']],
    });

    return records.map((record) => ({
      id: record.id,
      label: record.description,
    }));
  }
};
