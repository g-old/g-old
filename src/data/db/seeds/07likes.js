
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
  function getStatements() {
    return new Promise((resolve) => {
      knex.select('id').from('statements').pluck('id').then((data) => resolve(data));
    });
  }
  function getUniqueIDs(statements, num) {
    const ids = [];
    while (ids.length < num) {
      const id = random(statements);
      if (ids.indexOf(id) === -1) {
        ids.push(id);
      }
    }
    return ids;
  }
  function seeding() {
    return new Promise((resolve) => getUsers()
  .then((users) => {
    getStatements().then((statements) =>
      new Promise((resolv) => {
        const results = [];
        const updates = [];
        users.map((id) => {
          const num = randomNumber(statements.length);
          const ids = getUniqueIDs(statements, num);
          for (let i = 0; i < num; i += 1) {
            time = new Date();
            const statementID = ids[i];
            const data = {
              user_id: id,
              statement_id: statementID,
              created_at: time,
              updated_at: time
            };
            updates.push(knex('statements')
            .where({ id: statementID })
            .increment('likes', 1));
            results.push(data);
          }
          return null;
        });

        Promise.all(updates).then(() => {
          resolv(results);
        });
      })
    )
    .then((properties) => knex.into('likes').insert(properties))
    .then(() => resolve());
  })
  );
  }


  return knex
  .raw('ALTER TABLE likes DISABLE TRIGGER ALL;')
  .then(() => knex.raw('ALTER SEQUENCE likes_id_seq RESTART WITH 1;'))
  .then(() => knex('likes').del())
  .then(() => knex.raw('ALTER TABLE likes ENABLE TRIGGER ALL;')) // mysql :SET foreign_key_checks = 1;
  .then(seeding);
};
