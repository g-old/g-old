
function random(array) {
  return array[Math.floor(array.length * Math.random())];
}
function randomNumber(max) {
  return Math.floor(max * Math.random());
}

/* eslint comma-dangle: ["error", {"functions": "never"}]*/
exports.seed = function (knex, Promise) {
  let records = 40;
  const ar = [];
  while (records) { // TODO move to new Array(x) as soon as it is supported
    ar.push(1);
    records -= 1;
  }
  let time;
  let endTime;


  function seeding() {
    return Promise.resolve([
      'polling_modes'
    ])
  .map((table) => knex.select('id').from(table).pluck('id'))
  .spread((pollingModes) => ar.map(() => {
    time = new Date();
    endTime = new Date();
    endTime.setDate(time.getDate() + randomNumber(10));
    return {
      polling_mode_id: random(pollingModes),
      secret: Math.random() > 0.5,
      threshold: randomNumber(100),
      created_at: time,
      updated_at: time,
      start_time: time,
      end_time: endTime,
      num_voter: 10
    };
  }
)
)
.then((properties) => knex.into('polls').insert(properties)
  );
  }
  return knex
  .raw('ALTER TABLE polls DISABLE TRIGGER ALL;')
  .then(() => knex.raw('ALTER SEQUENCE polls_id_seq RESTART WITH 1;'))
  .then(() => knex('polls').del())
  .then(() => knex.raw('ALTER TABLE polls ENABLE TRIGGER ALL;')) // mysql :SET foreign_key_checks = 1;
  .then(seeding);
};
