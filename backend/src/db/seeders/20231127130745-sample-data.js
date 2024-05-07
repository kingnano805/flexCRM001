const db = require('../models');
const Users = db.users;

const Interactions = db.interactions;

const Leads = db.leads;

const Proposals = db.proposals;

const Reports = db.reports;

const Tasks = db.tasks;

const InteractionsData = [
  {
    date: new Date('2023-09-01T13:00:00Z'),

    type: 'email',

    notes: 'Sent introductory email.',

    // type code here for "relation_one" field
  },

  {
    date: new Date('2023-09-02T16:00:00Z'),

    type: 'meeting',

    notes: 'Discussed product features.',

    // type code here for "relation_one" field
  },

  {
    date: new Date('2023-09-03T10:00:00Z'),

    type: 'email',

    notes: 'Initial meeting to understand needs.',

    // type code here for "relation_one" field
  },

  {
    date: new Date('2023-09-04T14:30:00Z'),

    type: 'meeting',

    notes: 'Follow-up email after lost status.',

    // type code here for "relation_one" field
  },
];

const LeadsData = [
  {
    name: 'John Doe',

    email: 'johndoe@example.com',

    phone_number: '123-456-7890',

    status: 'qualified',

    last_contacted: new Date('2023-09-01T12:00:00Z'),

    // type code here for "relation_many" field

    // type code here for "relation_one" field
  },

  {
    name: 'Jane Smith',

    email: 'janesmith@example.com',

    phone_number: '098-765-4321',

    status: 'contacted',

    last_contacted: new Date('2023-09-02T15:30:00Z'),

    // type code here for "relation_many" field

    // type code here for "relation_one" field
  },

  {
    name: 'Alice Johnson',

    email: 'alicej@example.com',

    phone_number: '555-666-7777',

    status: 'lost',

    last_contacted: new Date('2023-09-03T09:45:00Z'),

    // type code here for "relation_many" field

    // type code here for "relation_one" field
  },

  {
    name: 'Bob Brown',

    email: 'bobb@example.com',

    phone_number: '222-333-4444',

    status: 'new',

    last_contacted: new Date('2023-09-04T14:20:00Z'),

    // type code here for "relation_many" field

    // type code here for "relation_one" field
  },
];

const ProposalsData = [
  {
    title: 'Web Development Project',

    date_created: new Date('2023-09-06'),

    date_sent: new Date('2023-09-07'),

    status: 'signed',

    // type code here for "files" field

    // type code here for "relation_one" field
  },

  {
    title: 'SEO Services Proposal',

    date_created: new Date('2023-09-08'),

    date_sent: new Date('2023-09-09'),

    status: 'sent',

    // type code here for "files" field

    // type code here for "relation_one" field
  },

  {
    title: 'Digital Marketing Strategy',

    date_created: new Date('2023-09-10'),

    date_sent: new Date('2023-09-11'),

    status: 'draft',

    // type code here for "files" field

    // type code here for "relation_one" field
  },

  {
    title: 'E-commerce Platform Development',

    date_created: new Date('2023-09-12'),

    date_sent: new Date('2023-09-13'),

    status: 'sent',

    // type code here for "files" field

    // type code here for "relation_one" field
  },
];

const ReportsData = [
  {
    title: 'Weekly Sales Report',

    date_generated: new Date('2023-09-21'),

    // type code here for "files" field

    // type code here for "relation_many" field
  },

  {
    title: 'Monthly Performance Analysis',

    date_generated: new Date('2023-09-22'),

    // type code here for "files" field

    // type code here for "relation_many" field
  },

  {
    title: 'Quarterly Lead Conversion Rates',

    date_generated: new Date('2023-09-23'),

    // type code here for "files" field

    // type code here for "relation_many" field
  },

  {
    title: 'Annual Market Trends',

    date_generated: new Date('2023-09-24'),

    // type code here for "files" field

    // type code here for "relation_many" field
  },
];

const TasksData = [
  {
    description: 'Follow up with John Doe',

    due_date: new Date('2023-09-16'),

    priority: 'high',

    status: 'pending',

    // type code here for "relation_one" field
  },

  {
    description: 'Prepare SEO proposal for Jane Smith',

    due_date: new Date('2023-09-17'),

    priority: 'high',

    status: 'completed',

    // type code here for "relation_one" field
  },

  {
    description: 'Update CRM with Alice Johnson meeting notes',

    due_date: new Date('2023-09-18'),

    priority: 'high',

    status: 'pending',

    // type code here for "relation_one" field
  },

  {
    description: 'Send revised proposal to Bob Brown',

    due_date: new Date('2023-09-19'),

    priority: 'high',

    status: 'in_progress',

    // type code here for "relation_one" field
  },
];

// Similar logic for "relation_many"

async function associateInteractionWithLead() {
  const relatedLead0 = await Leads.findOne({
    offset: Math.floor(Math.random() * (await Leads.count())),
  });
  const Interaction0 = await Interactions.findOne({
    order: [['id', 'ASC']],
    offset: 0,
  });
  if (Interaction0?.setLead) {
    await Interaction0.setLead(relatedLead0);
  }

  const relatedLead1 = await Leads.findOne({
    offset: Math.floor(Math.random() * (await Leads.count())),
  });
  const Interaction1 = await Interactions.findOne({
    order: [['id', 'ASC']],
    offset: 1,
  });
  if (Interaction1?.setLead) {
    await Interaction1.setLead(relatedLead1);
  }

  const relatedLead2 = await Leads.findOne({
    offset: Math.floor(Math.random() * (await Leads.count())),
  });
  const Interaction2 = await Interactions.findOne({
    order: [['id', 'ASC']],
    offset: 2,
  });
  if (Interaction2?.setLead) {
    await Interaction2.setLead(relatedLead2);
  }

  const relatedLead3 = await Leads.findOne({
    offset: Math.floor(Math.random() * (await Leads.count())),
  });
  const Interaction3 = await Interactions.findOne({
    order: [['id', 'ASC']],
    offset: 3,
  });
  if (Interaction3?.setLead) {
    await Interaction3.setLead(relatedLead3);
  }
}

// Similar logic for "relation_many"

async function associateLeadWithAssigned_to() {
  const relatedAssigned_to0 = await Users.findOne({
    offset: Math.floor(Math.random() * (await Users.count())),
  });
  const Lead0 = await Leads.findOne({
    order: [['id', 'ASC']],
    offset: 0,
  });
  if (Lead0?.setAssigned_to) {
    await Lead0.setAssigned_to(relatedAssigned_to0);
  }

  const relatedAssigned_to1 = await Users.findOne({
    offset: Math.floor(Math.random() * (await Users.count())),
  });
  const Lead1 = await Leads.findOne({
    order: [['id', 'ASC']],
    offset: 1,
  });
  if (Lead1?.setAssigned_to) {
    await Lead1.setAssigned_to(relatedAssigned_to1);
  }

  const relatedAssigned_to2 = await Users.findOne({
    offset: Math.floor(Math.random() * (await Users.count())),
  });
  const Lead2 = await Leads.findOne({
    order: [['id', 'ASC']],
    offset: 2,
  });
  if (Lead2?.setAssigned_to) {
    await Lead2.setAssigned_to(relatedAssigned_to2);
  }

  const relatedAssigned_to3 = await Users.findOne({
    offset: Math.floor(Math.random() * (await Users.count())),
  });
  const Lead3 = await Leads.findOne({
    order: [['id', 'ASC']],
    offset: 3,
  });
  if (Lead3?.setAssigned_to) {
    await Lead3.setAssigned_to(relatedAssigned_to3);
  }
}

async function associateProposalWithLead() {
  const relatedLead0 = await Leads.findOne({
    offset: Math.floor(Math.random() * (await Leads.count())),
  });
  const Proposal0 = await Proposals.findOne({
    order: [['id', 'ASC']],
    offset: 0,
  });
  if (Proposal0?.setLead) {
    await Proposal0.setLead(relatedLead0);
  }

  const relatedLead1 = await Leads.findOne({
    offset: Math.floor(Math.random() * (await Leads.count())),
  });
  const Proposal1 = await Proposals.findOne({
    order: [['id', 'ASC']],
    offset: 1,
  });
  if (Proposal1?.setLead) {
    await Proposal1.setLead(relatedLead1);
  }

  const relatedLead2 = await Leads.findOne({
    offset: Math.floor(Math.random() * (await Leads.count())),
  });
  const Proposal2 = await Proposals.findOne({
    order: [['id', 'ASC']],
    offset: 2,
  });
  if (Proposal2?.setLead) {
    await Proposal2.setLead(relatedLead2);
  }

  const relatedLead3 = await Leads.findOne({
    offset: Math.floor(Math.random() * (await Leads.count())),
  });
  const Proposal3 = await Proposals.findOne({
    order: [['id', 'ASC']],
    offset: 3,
  });
  if (Proposal3?.setLead) {
    await Proposal3.setLead(relatedLead3);
  }
}

// Similar logic for "relation_many"

async function associateTaskWithAssigned_to() {
  const relatedAssigned_to0 = await Users.findOne({
    offset: Math.floor(Math.random() * (await Users.count())),
  });
  const Task0 = await Tasks.findOne({
    order: [['id', 'ASC']],
    offset: 0,
  });
  if (Task0?.setAssigned_to) {
    await Task0.setAssigned_to(relatedAssigned_to0);
  }

  const relatedAssigned_to1 = await Users.findOne({
    offset: Math.floor(Math.random() * (await Users.count())),
  });
  const Task1 = await Tasks.findOne({
    order: [['id', 'ASC']],
    offset: 1,
  });
  if (Task1?.setAssigned_to) {
    await Task1.setAssigned_to(relatedAssigned_to1);
  }

  const relatedAssigned_to2 = await Users.findOne({
    offset: Math.floor(Math.random() * (await Users.count())),
  });
  const Task2 = await Tasks.findOne({
    order: [['id', 'ASC']],
    offset: 2,
  });
  if (Task2?.setAssigned_to) {
    await Task2.setAssigned_to(relatedAssigned_to2);
  }

  const relatedAssigned_to3 = await Users.findOne({
    offset: Math.floor(Math.random() * (await Users.count())),
  });
  const Task3 = await Tasks.findOne({
    order: [['id', 'ASC']],
    offset: 3,
  });
  if (Task3?.setAssigned_to) {
    await Task3.setAssigned_to(relatedAssigned_to3);
  }
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Interactions.bulkCreate(InteractionsData);

    await Leads.bulkCreate(LeadsData);

    await Proposals.bulkCreate(ProposalsData);

    await Reports.bulkCreate(ReportsData);

    await Tasks.bulkCreate(TasksData);

    await Promise.all([
      // Similar logic for "relation_many"

      await associateInteractionWithLead(),

      // Similar logic for "relation_many"

      await associateLeadWithAssigned_to(),

      await associateProposalWithLead(),

      // Similar logic for "relation_many"

      await associateTaskWithAssigned_to(),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('interactions', null, {});

    await queryInterface.bulkDelete('leads', null, {});

    await queryInterface.bulkDelete('proposals', null, {});

    await queryInterface.bulkDelete('reports', null, {});

    await queryInterface.bulkDelete('tasks', null, {});
  },
};
