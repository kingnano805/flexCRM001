const db = require('../models');
const FileDBApi = require('./file');
const crypto = require('crypto');
const Utils = require('../utils');

const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

module.exports = class ProposalsDBApi {
  static async create(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const proposals = await db.proposals.create(
      {
        id: data.id || undefined,

        title: data.title || null,
        date_created: data.date_created || null,
        date_sent: data.date_sent || null,
        status: data.status || null,
        importHash: data.importHash || null,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await proposals.setLead(data.lead || null, {
      transaction,
    });

    await FileDBApi.replaceRelationFiles(
      {
        belongsTo: db.proposals.getTableName(),
        belongsToColumn: 'document',
        belongsToId: proposals.id,
      },
      data.document,
      options,
    );

    return proposals;
  }

  static async bulkImport(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    // Prepare data - wrapping individual data transformations in a map() method
    const proposalsData = data.map((item, index) => ({
      id: item.id || undefined,

      title: item.title || null,
      date_created: item.date_created || null,
      date_sent: item.date_sent || null,
      status: item.status || null,
      importHash: item.importHash || null,
      createdById: currentUser.id,
      updatedById: currentUser.id,
      createdAt: new Date(Date.now() + index * 1000),
    }));

    // Bulk create items
    const proposals = await db.proposals.bulkCreate(proposalsData, {
      transaction,
    });

    // For each item created, replace relation files

    for (let i = 0; i < proposals.length; i++) {
      await FileDBApi.replaceRelationFiles(
        {
          belongsTo: db.proposals.getTableName(),
          belongsToColumn: 'document',
          belongsToId: proposals[i].id,
        },
        data[i].document,
        options,
      );
    }

    return proposals;
  }

  static async update(id, data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const proposals = await db.proposals.findByPk(id, {}, { transaction });

    await proposals.update(
      {
        title: data.title || null,
        date_created: data.date_created || null,
        date_sent: data.date_sent || null,
        status: data.status || null,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await proposals.setLead(data.lead || null, {
      transaction,
    });

    await FileDBApi.replaceRelationFiles(
      {
        belongsTo: db.proposals.getTableName(),
        belongsToColumn: 'document',
        belongsToId: proposals.id,
      },
      data.document,
      options,
    );

    return proposals;
  }

  static async remove(id, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const proposals = await db.proposals.findByPk(id, options);

    await proposals.update(
      {
        deletedBy: currentUser.id,
      },
      {
        transaction,
      },
    );

    await proposals.destroy({
      transaction,
    });

    return proposals;
  }

  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const proposals = await db.proposals.findOne({ where }, { transaction });

    if (!proposals) {
      return proposals;
    }

    const output = proposals.get({ plain: true });

    output.document = await proposals.getDocument({
      transaction,
    });

    output.lead = await proposals.getLead({
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
        model: db.leads,
        as: 'lead',
      },

      {
        model: db.file,
        as: 'document',
      },
    ];

    if (filter) {
      if (filter.id) {
        where = {
          ...where,
          ['id']: Utils.uuid(filter.id),
        };
      }

      if (filter.title) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('proposals', 'title', filter.title),
        };
      }

      if (filter.date_createdRange) {
        const [start, end] = filter.date_createdRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            date_created: {
              ...where.date_created,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            date_created: {
              ...where.date_created,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.date_sentRange) {
        const [start, end] = filter.date_sentRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            date_sent: {
              ...where.date_sent,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            date_sent: {
              ...where.date_sent,
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

      if (filter.lead) {
        var listItems = filter.lead.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          leadId: { [Op.or]: listItems },
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
          count: await db.proposals.count({
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
      : await db.proposals.findAndCountAll({
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
          Utils.ilike('proposals', 'title', query),
        ],
      };
    }

    const records = await db.proposals.findAll({
      attributes: ['id', 'title'],
      where,
      limit: limit ? Number(limit) : undefined,
      orderBy: [['title', 'ASC']],
    });

    return records.map((record) => ({
      id: record.id,
      label: record.title,
    }));
  }
};
