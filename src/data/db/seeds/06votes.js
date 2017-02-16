
// from https://github.com/tgriesser/knex/issues/744

function random(array) {
  return array[Math.floor(array.length * Math.random())];
}


/* eslint comma-dangle: ["error", {"functions": "never"}]*/
exports.seed = function (knex, Promise) {
  let records = 200;
  const ar = [];
  while (records) { // TODO move to new Array(x) as soon as it is supported
    ar.push(1);
    records -= 1;
  }
  let time;

// TODO This fn is wrong as it can insert multiple votes for the same proposal
  function seeding() {
    return Promise.resolve([
      'users',
      'proposals'])
  .map((table) => knex.select('id').from(table).pluck('id'))
  .spread((users, proposals) => ar.map(() => {
    time = new Date();
    return {
      user_id: random(users),
      proposal_id: random(proposals),
      position: Math.random() < 0.5 ? 'pro' : 'con',
      created_at: time,
      updated_at: time
    };
  }
)
)
.then((properties) => knex.into('votes').insert(properties)
  );
  }
  return knex
  .raw('ALTER TABLE votes DISABLE TRIGGER ALL;')
  .then(() => knex('votes').del())
  .then(() => knex.raw('ALTER TABLE votes ENABLE TRIGGER ALL;')) // mysql :SET foreign_key_checks = 1;
  .then(seeding);
};
