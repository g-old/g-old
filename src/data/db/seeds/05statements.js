
const faker = require('faker');
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


  return Promise.resolve([
    'users',
    'proposals'])
  .map((table) => knex.select('id').from(table).pluck('id'))
  .spread((users, proposals) => ar.map(() => {
    time = new Date();
    return {
      author_id: random(users),
      proposal_id: random(proposals),
      title: faker.lorem.sentence(),
      body: faker.lorem.paragraph(),
      position: Math.random() < 0.5 ? 'pro' : 'con',
      created_at: time,
      updated_at: time
    };
  }
)
)
.then((properties) => knex.into('statements').insert(properties)
  );
};
