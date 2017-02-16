
// from https://github.com/tgriesser/knex/issues/744

function random(array) {
  return array[Math.floor(array.length * Math.random())];
}
function randomNumber(max) {
  return Math.floor(max * Math.random());
}

/* eslint comma-dangle: ["error", {"functions": "never"}]*/
exports.seed = function (knex, Promise) {
  let time;

  function getUsers() {
    return new Promise((resolve) => {
      knex.select('id').from('users').pluck('id').then((data) => resolve(data));
    });
  }
  function getProposals() {
    return new Promise((resolve) => {
      knex.select('id').from('proposals').pluck('id').then((data) => resolve(data));
    });
  }
  function getUniqueIDs(proposals, num) {
    const ids = [];
    while (ids.length < num) {
      const id = random(proposals);
      if (ids.indexOf(id) === -1) {
        ids.push(id);
      }
    }
    return ids;
  }
  function seeding() {
    return new Promise((resolve) => getUsers()
  .then((users) => {
    getProposals().then((proposals) =>
      new Promise((resolv) => {
        const results = [];
        const updates = [];
        users.map((id) => {
          const num = randomNumber(proposals.length);
          const ids = getUniqueIDs(proposals, num);
          for (let i = 0; i < num; i += 1) {
            time = new Date();
            const proposalID = ids[i];
            const data = {
              user_id: id,
              proposal_id: proposalID,
              position: Math.random() < 0.5 ? 'pro' : 'con',
              created_at: time,
              updated_at: time
            };
            updates.push(knex('proposals')
            .where({ id: proposalID })
            .increment('votes', 1));
            results.push(data);
          }
          return null;
        });

        Promise.all(updates).then(() => {
          resolv(results);
        });
      })
    )
    .then((properties) => knex.into('votes').insert(properties))
    .then(() => resolve());
  })
  );
  }


  return knex
  .raw('ALTER TABLE votes DISABLE TRIGGER ALL;')
  .then(() => knex('votes').del())
  .then(() => knex.raw('ALTER TABLE votes ENABLE TRIGGER ALL;')) // mysql :SET foreign_key_checks = 1;
  .then(seeding);
};
