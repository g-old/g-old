const faker = require('faker');
// from https://github.com/tgriesser/knex/issues/744

function random(array) {
  return array[Math.floor(array.length * Math.random())];
}
function randomDistance(max) {
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


  return Promise.resolve([
    'users',
    'quorums'
  ])
  .map((table) => knex.select('id').from(table).pluck('id'))
  .spread((users, quorums) => ar.map(() => {
    time = new Date();
    endTime = new Date();
    endTime.setDate(time.getDate() + randomDistance(10));
    return {
      author_id: random(users),
      quorum_id: random(quorums),
      title: faker.lorem.sentence(),
      body: faker.lorem.paragraph(),
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
};
