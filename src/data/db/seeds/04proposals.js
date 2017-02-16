const faker = require('faker');
// from https://github.com/tgriesser/knex/issues/744

function random(array) {
  return array[Math.floor(array.length * Math.random())];
}
function randomNumber(max) {
  return Math.floor(max * Math.random());
}

/* eslint comma-dangle: ["error", {"functions": "never"}]*/
exports.seed = function (knex, Promise) {
  let records = 20;
  const ar = [];
  while (records) { // TODO move to new Array(x) as soon as it is supported
    ar.push(1);
    records -= 1;
  }
  let time;
  let endTime;


  function seeding() {
    return Promise.resolve([
      'users',
      'quorums'
    ])
  .map((table) => knex.select('id').from(table).pluck('id'))
  .spread((users, quorums) => ar.map(() => {
    time = new Date();
    endTime = new Date();
    endTime.setDate(time.getDate() + randomNumber(10));
    return {
      author_id: random(users),
      quorum_id: random(quorums),
      title: faker.lorem.sentence(),
      body: faker.lorem.paragraphs(randomNumber(4)),
      state: 'ask_vote',
      created_at: time,
      updated_at: time,
      vote_started_at: time,
      vote_ends_at: endTime
    };
  }
)
)
.then((properties) => knex.into('proposals').insert(properties)
  );
  }
  return knex
  .raw('ALTER TABLE proposals DISABLE TRIGGER ALL;')
  .then(() => knex.raw('ALTER SEQUENCE proposals_id_seq RESTART WITH 1;'))
  .then(() => knex('proposals').del())
  .then(() => knex.raw('ALTER TABLE proposals ENABLE TRIGGER ALL;')) // mysql :SET foreign_key_checks = 1;
  .then(seeding);
};
