exports.seed = function (knex, Promise) {
  // Deletes ALL existing entries
  // TODO maybe put in a transaction
  const deleteQueue = [
    knex('activities')
      .del()
      .then(() => knex.raw('ALTER SEQUENCE activities_id_seq RESTART WITH 1;')),
    knex('feeds').del().then(() => knex.raw('ALTER SEQUENCE feeds_id_seq RESTART WITH 1;')),
    knex('system_feeds')
      .del()
      .then(() => knex.raw('ALTER SEQUENCE system_feeds_id_seq RESTART WITH 1;')),
    knex('flagged_statements')
      .del()
      .then(() => knex.raw('ALTER SEQUENCE flagged_statements_id_seq RESTART WITH 1;')),
    knex('tags').del().then(() => knex.raw('ALTER SEQUENCE tags_id_seq RESTART WITH 1;')),
    knex('proposal_tags')
      .del()
      .then(() => knex.raw('ALTER SEQUENCE proposal_tags_id_seq RESTART WITH 1;')),
    knex('user_follows')
      .del()
      .then(() => knex.raw('ALTER SEQUENCE user_follows_id_seq RESTART WITH 1;')),
    knex('statement_likes')
      .del()
      .then(() => knex.raw('ALTER SEQUENCE statement_likes_id_seq RESTART WITH 1;')),
    knex('statements')
      .del()
      .then(() => knex.raw('ALTER SEQUENCE statements_id_seq RESTART WITH 1;')),
    knex('votes').del().then(() => knex.raw('ALTER SEQUENCE votes_id_seq RESTART WITH 1;')),
    knex('proposals').del().then(() => knex.raw('ALTER SEQUENCE proposals_id_seq RESTART WITH 1;')),

    knex('polls').del().then(() => knex.raw('ALTER SEQUENCE polls_id_seq RESTART WITH 1;')),
    knex('polling_modes')
      .del()
      .then(() => knex.raw('ALTER SEQUENCE polling_modes_id_seq RESTART WITH 1;')),
    knex('users').del().then(() => knex.raw('ALTER SEQUENCE users_id_seq RESTART WITH 1;')),
    knex('roles').del().then(),
  ];
  /* const chain = deleteQueue.reduce(
    (soFar, f) => soFar.then(f,(e)=>{console.log(e)}),
    Promise.resolve(console.log('deleting entries in table ... '))
  ).catch((e)=> console.log(e));
  return chain.catch((e)=>console.log(e));*/
  return Promise.each(deleteQueue, () => console.info('deleting entries in table ... '));
};
