
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

  function getTags() {
    return new Promise((resolve) => {
      knex.select('id').from('tags').pluck('id').then((data) => resolve(data));
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
    return new Promise((resolve) => getTags()
  .then((tags) => {
    getProposals().then((proposals) =>
      new Promise((resolv) => {
        const results = [];
        const updates = [];
        tags.map((id) => {
          const num = randomNumber(proposals.length);
          const ids = getUniqueIDs(proposals, num);
          for (let i = 0; i < num; i += 1) {
            time = new Date();
            const proposalID = ids[i];
            const data = {
              proposal_id: proposalID,
              tag_id: id,
              created_at: time,
              updated_at: time
            };
            updates.push(knex('tags')
            .where({ id: proposalID })
            .increment('count', 1));
            results.push(data);
          }
          return null;
        });

        Promise.all(updates).then(() => {
          resolv(results);
        });
      })
    )
    .then((properties) => knex.into('proposal_tags').insert(properties))
    .then(() => resolve());
  })
  );
  }


  return knex
  .raw('ALTER TABLE proposal_tags DISABLE TRIGGER ALL;')
  .then(() => knex.raw('ALTER SEQUENCE proposal_tags_id_seq RESTART WITH 1;'))
  .then(() => knex('proposal_tags').del())
  .then(() => knex.raw('ALTER TABLE proposal_tags ENABLE TRIGGER ALL;')) // mysql :SET foreign_key_checks = 1;
  .then(seeding);
};
