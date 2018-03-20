exports.seed = function(knex, Promise) {
  /* eslint-disable comma-dangle */

  return Promise.resolve(
    knex('platform_settings').insert({
      settings: { names: { default_name: 'default name' } },
      created_at: new Date(),
    }),
  ).catch(e => console.info(e));
};
