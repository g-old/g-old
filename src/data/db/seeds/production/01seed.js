/* See organization.js for the values */
const SUPER_USER = 1;
const SYSTEM = 512;
const hash = '$2a$10$2ZX.2Lgicib1coH163pIH.WsQdCcEnqAyglEa.6LYTVHnFqEVlOhe';

exports.seed = function(knex) {
  /* eslint-disable comma-dangle */

  function createUser(
    name,
    surname,
    passwordHash,
    email,
    groups,
    time,
    emailVerified,
    thumbnail,
  ) {
    return knex('users').insert({
      name,
      surname,
      password_hash: passwordHash,
      email,
      groups,
      created_at: time,
      updated_at: time,
      email_verified: emailVerified,
      thumbnail:
        thumbnail ||
        `https://api.adorable.io/avatars/32/${name}${surname}.io.png`,
    });
  }

  function createSystemFeeds() {
    return Promise.resolve(
      knex('system_feeds').insert({
        group_id: 1,
        type: 'GROUP',
        main_activities: JSON.stringify([]),
        activities: JSON.stringify([]),
      }),
    );
  }

  function createSuperUser() {
    return createUser(
      'Superuser',
      'Superuser',
      hash,
      'superuser@example.com',
      SUPER_USER,
      new Date(),
      false,
    );
  }

  function createBot() {
    return createUser(
      'VIP',
      'Bot',
      hash,
      'vip-bot@example.com',
      SYSTEM,
      new Date(),
      false,
      '/tile.png',
    );
  }

  function createPollingmodes() {
    const data = [
      {
        name: 'propose',
        unipolar: true,
        with_statements: false,
        threshold_ref: 'all',
      },
      {
        name: 'vote',
        unipolar: false,
        with_statements: true,
        threshold_ref: 'voters',
      },
      {
        name: 'survey',
        unipolar: false,
        with_statements: false,
        threshold_ref: 'voters',
      },
    ];
    return Promise.resolve(
      knex('polling_modes')
        .insert(data)
        .returning('id')
        .then(ids => ({ proposeId: ids[0], voteId: ids[1] })),
    );
  }

  return Promise.resolve(
    createPollingmodes()
      .then(createSuperUser)
      .then(createBot)
      .then(() => createSystemFeeds({ proposalFeedID: 1, statementFeedID: 2 }))
      .catch(e => console.error(e)),
  );
};
