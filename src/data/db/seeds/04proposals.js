const faker = require('faker');
// from https://github.com/tgriesser/knex/issues/744


function randomUnique(array) {
  const index = [Math.floor(array.length * Math.random())];
  const res = array[index];
  array.splice(index, 1);
  return res;
}
function random(array) {
  return array[Math.floor(array.length * Math.random())];
}
function randomNumber(max) {
  return Math.floor(max * Math.random());
}


/* eslint comma-dangle: ["error", {"functions": "never"}]*/
exports.seed = function (knex, Promise) {
  function getPhaseOnePollIds() {
    return knex.select('polls.id').from('polls')
    .join('polling_modes', 'polls.polling_mode_id', '=', 'polling_modes.id')
    .where('polling_modes.name', '=', 'propose')
    .pluck('polls.id');
  }

  function getPhaseTwoPollIds() {
    return knex.select('polls.id').from('polls')
    .join('polling_modes', 'polls.polling_mode_id', '=', 'polling_modes.id')
    .where('polling_modes.name', '=', 'vote')
    .pluck('polls.id');
  }

  function getUserIds() {
    return knex.select('id').from('users').pluck('id');
  }
  let records = 10;
  const ar = [];
  while (records) { // TODO move to new Array(x) as soon as it is supported
    ar.push(1);
    records -= 1;
  }
  let time;
  function seeding() {
    return Promise.all([getUserIds(), getPhaseOnePollIds(), getPhaseTwoPollIds()])
  .then((data) => {
    const res = [];
    let prop;

    const users = data[0];
    const one = data[1];
    const two = data[2];

    time = new Date();
    const length = one.length > two.length ? two.length : one.length;
    for (let i = 0; i < length; i += 1) {
      prop = {
        author_id: random(users),
        poll_one_id: randomUnique(one),
        poll_two_id: randomUnique(two),
        title: faker.lorem.sentence(),
        body: faker.lorem.paragraphs(randomNumber(4) || 1),
        state: 'proposed',
        created_at: time,
        updated_at: time
      };
      res.push(prop);
    }
    return res;
  })
  .then((properties) => knex.into('proposals').insert(properties));
  }

  return knex
  .raw('ALTER TABLE proposals DISABLE TRIGGER ALL;')
  .then(() => knex.raw('ALTER SEQUENCE proposals_id_seq RESTART WITH 1;'))
  .then(() => knex('proposals').del())
  .then(() => knex.raw('ALTER TABLE proposals ENABLE TRIGGER ALL;')) // mysql :SET foreign_key_checks = 1;
  .then(seeding);
};
