

exports.seed = function (knex, Promise) {
  /* eslint-disable comma-dangle */

  function createRoles() {
    return Promise.resolve(
      Promise.all([
        // Inserts seed entries
        knex('roles').insert({ id: 1, type: 'admin' }),
        knex('roles').insert({ id: 2, type: 'mod' }),
        knex('roles').insert({ id: 3, type: 'user' }),
        knex('roles').insert({ id: 4, type: 'viewer' }),
        knex('roles').insert({ id: 5, type: 'guest' }),
      ])
    );
  }

  function createSystemFeeds({proposalFeedID, statementFeedID}) {
    return Promise.resolve(
      knex('system_feeds').insert([
        { user_id: proposalFeedID, activity_ids: JSON.stringify([]) },
        { user_id: statementFeedID, activity_ids: JSON.stringify([]) },
      ])
    );
  }

  function createAdmin(){
    const hash = '$2a$10$2ZX.2Lgicib1coH163pIH.WsQdCcEnqAyglEa.6LYTVHnFqEVlOhe'
    return createUser('Admin', 'Admin',hash,'admin@example.com',1, new Date(),false,1023);
  }

  function createUser(name, surname, passwordHash, email, roleId, time, emailVerified, privilege) {
    return knex('users').insert({
      name,
      surname,
      password_hash: passwordHash,
      email,
      role_id: roleId,
      created_at: time,
      updated_at: time,
      email_verified: emailVerified,
      privilege: privilege || 1,
      avatar_path: `https://api.adorable.io/avatars/32/${name}${surname}.io.png`,
    });
  }










  function createPollingmodes() {
    const data = [
      {  name: 'propose', unipolar: true, with_statements: false, threshold_ref: 'all' },
      {  name: 'vote', unipolar: false, with_statements: true, threshold_ref: 'voters' },
      {  name: 'survey', unipolar: false, with_statements: false, threshold_ref: 'voters' },
    ];
    return Promise.resolve(
      knex('polling_modes')
        .insert(data)
        .returning('id')
        .then(ids => ({ proposeId: ids[0], voteId: ids[1] }))
    );
  }



  return Promise.resolve(
    createRoles()
      .then(createPollingmodes)
      .then(createAdmin)
      .then(()=>createSystemFeeds({proposalFeedID: 1, statementFeedID:2}))
      .catch(e => console.log(e))
  );
};
