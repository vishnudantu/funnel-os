/**
 * Seed funnel stages with default pipeline
 */

/** @param { import('knex').Knex } knex */
export async function seed(knex) {
  await knex('funnel_stages').del();

  const stages = [
    { name: 'New Lead', order: 1, color: '#3B82F6', auto_action: true },
    { name: 'Contacted', order: 2, color: '#8B5CF6', auto_action: false },
    { name: 'Qualified', order: 3, color: '#16A34A', auto_action: false },
    { name: 'Proposal', order: 4, color: '#F59E0B', auto_action: false },
    { name: 'Negotiation', order: 5, color: '#EF4444', auto_action: false },
    { name: 'Closed Won', order: 6, color: '#10B981', auto_action: true },
    { name: 'Closed Lost', order: 7, color: '#6B7280', auto_action: true },
  ];

  await knex('funnel_stages').insert(
    stages.map((stage) => ({
      ...stage,
      id: knex.raw('generate_uuid()'),
    }))
  );
}
