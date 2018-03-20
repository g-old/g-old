exports.seed = function(knex, Promise) {
  /* eslint-disable comma-dangle */
  function createUser(
    name,
    surname,
    passwordHash,
    email,
    rights,
    time,
    emailVerified,
  ) {
    return knex('users').insert({
      name,
      surname,
      password_hash: passwordHash,
      rights: JSON.stringify(rights),
      email,
      created_at: time,
      email_verified: emailVerified,
    });
  }
  function createSuperUser() {
    const hash = '$2a$10$2ZX.2Lgicib1coH163pIH.WsQdCcEnqAyglEa.6LYTVHnFqEVlOhe';
    return createUser(
      'Super',
      'User',
      hash,
      'superuser@example.com',
      { platform: ['superuser'] },
      new Date(),
      false,
    );
  }

  return Promise.resolve(createSuperUser()).catch(e => console.info(e));
};
