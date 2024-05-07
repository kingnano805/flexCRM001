const db = require('../models');
const FileDBApi = require('./file');
const crypto = require('crypto');
const Utils = require('../utils');

const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

module.exports = class LeadsDBApi {
  static async create(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const leads = await db.leads.create(
      {
        id: data.id || undefined,

        name: data.name || null,
        email: data.email || null,
        phone_number: data.phone_number || null,
        status: data.status || null,
        last_contacted: data.last_contacted || null,
        importHash: data.importHash || null,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await leads.setAssigned_to(data.assigned_to || null, {
      transaction,
    });

    await leads.setInteractions(data.interactions || [], {
      transaction,
    });

    return leads;
  }

  static async bulkImport(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    // Prepare data - wrapping individual data transformations in a map() method
    const leadsData = data.map((item, index) => ({
      id: item.id || undefined,

      name: item.name || null,
      email: item.email || null,
      phone_number: item.phone_number || null,
      status: item.status || null,
      last_contacted: item.last_contacted || null,
      importHash: item.importHash || null,
      createdById: currentUser.id,
      updatedById: currentUser.id,
      createdAt: new Date(Date.now() + index * 1000),
    }));

    // Bulk create items
    const leads = await db.leads.bulkCreate(leadsData, { transaction });

    // For each item created, replace relation files

    return leads;
  }

  static async update(id, data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const leads = await db.leads.findByPk(id, {}, { transaction });

    await leads.update(
      {
        name: data.name || null,
        email: data.email || null,
        phone_number: data.phone_number || null,
        status: data.status || null,
        last_contacted: data.last_contacted || null,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await leads.setAssigned_to(data.assigned_to || null, {
      transaction,
    });

    await leads.setInteractions(data.interactions || [], {
      transaction,
    });

    return leads;
  }

  static async remove(id, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const leads = await db.leads.findByPk(id, options);

    await leads.update(
      {
        deletedBy: currentUser.id,
      },
      {
        transaction,
      },
    );

    await leads.destroy({
      transaction,
    });

    return leads;
  }

  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const leads = await db.leads.findOne({ where }, { transaction });

    if (!leads) {
      return leads;
    }

    const output = leads.get({ plain: true });

    output.interactions_lead = await leads.getInteractions_lead({
      transaction,
    });

    output.proposals_lead = await leads.getProposals_lead({
      transaction,
    });

    output.interactions = await leads.getInteractions({
      transaction,
    });

    output.assigned_to = await leads.getAssigned_to({
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

      {
        model: db.interactions,
        as: 'interactions',
        through: filter.interactions
          ? {
              where: {
                [Op.or]: filter.interactions.split('|').map((item) => {
                  return { ['Id']: Utils.uuid(item) };
                }),
              },
            }
          : null,
        required: filter.interactions ? true : null,
      },
    ];

    if (filter) {
      if (filter.id) {
        where = {
          ...where,
          ['id']: Utils.uuid(filter.id),
        };
      }

      if (filter.name) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('leads', 'name', filter.name),
        };
      }

      if (filter.email) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('leads', 'email', filter.email),
        };
      }

      if (filter.phone_number) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('leads', 'phone_number', filter.phone_number),
        };
      }

      if (filter.last_contactedRange) {
        const [start, end] = filter.last_contactedRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            last_contacted: {
              ...where.last_contacted,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            last_contacted: {
              ...where.last_contacted,
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
          count: await db.leads.count({
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
      : await db.leads.findAndCountAll({
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
          Utils.ilike('leads', 'name', query),
        ],
      };
    }

    const records = await db.leads.findAll({
      attributes: ['id', 'name'],
      where,
      limit: limit ? Number(limit) : undefined,
      orderBy: [['name', 'ASC']],
    });

    return records.map((record) => ({
      id: record.id,
      label: record.name,
    }));
  }
};
