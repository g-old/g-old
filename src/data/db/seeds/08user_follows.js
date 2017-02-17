
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
  function getFollowers() {
    return new Promise((resolve) => {
      knex.select('id').from('users').pluck('id').then((data) => resolve(data));
    });
  }
  function getUniqueIDs(users, num, ownId) {
    const ids = [];
    while (ids.length < num) {
      const id = random(users);
      if (ids.indexOf(id) === -1 && id !== ownId) {
        ids.push(id);
      }
    }
    return ids;
  }
  function seeding() {
    return new Promise((resolve) => getUsers()
  .then((users) => {
    getFollowers().then((usersIds) =>
      new Promise((resolv) => {
        const results = [];
        users.map((id) => {
          let num = randomNumber(usersIds.length);
          num = num <= 5 ? num : 5;
          const ids = getUniqueIDs(usersIds, num, id);
          for (let i = 0; i < num; i += 1) {
            time = new Date();
            const followeeID = ids[i];
            const data = {
              follower_id: id,
              followee_id: followeeID,
              created_at: time,
              updated_at: time
            };
            results.push(data);
          }
          return null;
        });
        resolv(results);
      })
    )
    .then((properties) => knex.into('user_follows').insert(properties))
    .then(() => resolve());
  })
  );
  }


  return knex
  .raw('ALTER TABLE user_follows DISABLE TRIGGER ALL;')
  .then(() => knex.raw('ALTER SEQUENCE user_follows_id_seq RESTART WITH 1;'))
  .then(() => knex('user_follows').del())
  .then(() => knex.raw('ALTER TABLE user_follows ENABLE TRIGGER ALL;')) // mysql :SET foreign_key_checks = 1;
  .then(seeding);
};
