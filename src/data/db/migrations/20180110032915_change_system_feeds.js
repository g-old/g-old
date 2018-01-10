// TODO better design when including groups
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema
      .table('system_feeds', table => {
        table.renameColumn('user_id', 'group_id');
        table.renameColumn('activity_ids', 'main_activities');
        table.json('activities').defaultsTo('[]');
        table.enu('type', ['WT', 'GROUP']).defaultsTo('GROUP');
        table.unique(['group_id', 'type']);
      })
      .then(() => {
        knex.schema.raw(`
       ALTER TABLE "system_feeds" ALTER COLUMN "main_activities" SET DEFAULT '[]';
     `);
      }),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('system_feeds', table => {
      table.dropUnique(['group_id', 'type']);
      table.renameColumn('group_id', 'user_id');
      table.renameColumn('main_activities', 'activity_ids');
      table.dropColumn('activities');
      table.dropColumn('type');
    }),
  ]);
};
