const faker = require('faker');
/* eslint comma-dangle: ["error", {"functions": "never"}]*/

exports.seed = function (knex, Promise) {
  // Deletes ALL existing entries
  const tags = [];
  let tag;
  for (let i = 0; i < 10; i += 1) {
    tag = knex('tags').insert({
      text: faker.lorem.word()
    });
    tags.push(tag);
  }
  return knex
  .raw('ALTER TABLE tags DISABLE TRIGGER ALL;')
  .then(() => knex.raw('ALTER SEQUENCE tags_id_seq RESTART WITH 1;'))
  .then(() => knex('tags').del())
  .then(() => knex.raw('ALTER TABLE tags ENABLE TRIGGER ALL;')) // mysql :SET foreign_key_checks = 1;
  .then(() =>
       Promise.all(tags)
    );
};
