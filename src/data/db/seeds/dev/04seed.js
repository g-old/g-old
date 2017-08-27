/* eslint-disable comma-dangle */

const proposalFeedID = 1;
const statementFeedID = 2;
const maxActivitiesNum = 30;
const fillRate = 100;
const numActivitiesPerFeed = (maxActivitiesNum / 100) * fillRate;

function randomNumber(max) {
  return Math.floor(max * Math.random());
}

exports.seed = function (knex, Promise) {
  function createSystemFeeds() {
    return Promise.resolve(
      knex('system_feeds').insert([
        { user_id: proposalFeedID, activity_ids: JSON.stringify([]) },
        { user_id: statementFeedID, activity_ids: JSON.stringify([]) },
      ])
    );
  }
  function createActivity(object) {
    let verb = null;
    let createdAt = null;
    let data = null;
    return new Promise((resolve) => {
      if ('likes' in object) {
        // statement
        const verbs = ['create', 'delete', 'update', 'close', 'reject', 'accept'];

        const randNum = Math.random();
        if (randNum > 0.3) {
          if (randNum > 0.6) {
            verb = verbs[1];
          } else {
            verb = verbs[2];
          }
        } else {
          verb = verbs[0];
        }

        if (verb === 'create') {
          // some random old time
          const time = new Date(object.created_at);
          createdAt = new Date();
          createdAt.setDate(time.getDate() - randomNumber(30));
        } else {
          const time = new Date(object.created_at);
          createdAt = new Date();
          createdAt.setDate(time.getDate() - randomNumber(30));
        }

        data = {
          actor_id: object.author_id,
          verb,
          type: 'statement',
          object_id: object.id,
          content: JSON.stringify(object),
          created_at: createdAt,
        };
      } else if ('state' in object) {
        // proposal
        verb = object.state === 'proposed' || object.state === 'voting' ? 'create' : 'close';
        if (object.state === 'proposed' || object.state === 'voting') {
          verb = 'create';

          if (object.state === 'voting' && Math.random() > 0.7) {
            verb = 'close';
          }
        } else if (object.state === 'accepted') {
          verb = 'accept';
        } else {
          verb = 'reject';
        }
        if (verb === 'create') {
          const time = new Date(object.created_at);
          createdAt = new Date();
          createdAt.setDate(time.getDate() - randomNumber(60));
        } else if (verb === 'close') {
          const time = new Date(object.created_at);
          createdAt = new Date();
          createdAt.setDate(time.getDate() - randomNumber(2));
        } else {
          const time = new Date(object.created_at);
          createdAt = new Date();
          createdAt.setDate(time.getDate() - randomNumber(200));
        }

        data = {
          actor_id: object.author_id,
          verb,
          type: 'proposal',
          object_id: object.id,
          content: JSON.stringify(object),
          created_at: createdAt,
        };
      } else if ('position' in object) {
        // vote
        verb = Math.random() > 0.5 ? 'create' : 'update';
        if (verb === 'update') {
          const time = new Date(object.created_at);
          createdAt = new Date();
          createdAt.setDate(time.getDate() - randomNumber(5));
        } else {
          const time = new Date(object.created_at);
          createdAt = new Date();
          createdAt.setDate(time.getDate() - randomNumber(70));
        }

        data = { actor_id: object.user_id, verb, type: 'vote', object_id: object.id, content: JSON.stringify(object),
 created_at: createdAt };
      }
      knex('activities').insert(data).returning('id').then(id => resolve(id));
    });
  }
  function genActivitiesFromProposals(data, feedId) {
    return Promise.all([
      Promise.all(data[0].map(p => createActivity(p))),
      Promise.all(data[1].map(p => createActivity(p))),
      Promise.all(data[2].map(p => createActivity(p))),
    ]).then((allIds) => {
      const pIds = allIds.reduce((acc, curr) => acc.concat(curr), []);
      return knex('system_feeds').where({ user_id: feedId }).update({
        activity_ids: JSON.stringify(pIds.reduce((acc, curr) => acc.concat(curr), []))
      });
    });
  }

  function fillProposalsFeed(feedId, numActivities) {
    return Promise.all([
      knex('proposals')
        .where({ state: 'proposed' })
        .orderBy('created_at', 'desc')
        .limit(numActivities / 3)
        .select(),
      knex('proposals')
        .where({ state: 'accepted' })
        .orderBy('created_at', 'desc')
        .limit(numActivities / 3)
        .select(),
      knex('proposals')
        .where({ state: 'rejected' })
        .orderBy('created_at', 'desc')
        .limit(numActivities / 3)
        .select(),
    ])
      .then(data => genActivitiesFromProposals(data, feedId));
  }

  function genActivitiesFromStatements(data, feedId) {
    return Promise.all(data.map(p => createActivity(p))).then(ids =>
      knex('system_feeds').where({ user_id: feedId }).update({
        activity_ids: JSON.stringify(ids.reduce((acc, curr) => acc.concat(curr), [])),
      })
    );
  }

  function fillStatementsFeed(feedId, numActivities) {
    // get statements
    return knex('statements')
      .limit(numActivities)
      .select()
      .then(data => genActivitiesFromStatements(data, feedId));
  }

  function fillUserFeed(userId) {
    return Promise.all([
      knex('statements').where({ author_id: userId }).limit(10).select(),
      knex('votes').where({ user_id: userId }).limit(20).select(),
    ])
      .then(data => Promise.resolve(data.reduce((acc, curr) => acc.concat(curr), [])))
      .then(objects => Promise.all(objects.map(o => createActivity(o))))
      .then(ids =>
        knex('feeds').insert({
          user_id: userId,
          activity_ids: JSON.stringify(ids.reduce((acc, curr) => acc.concat(curr), [])),
        })
      );
  }


  function createFolloweesForAccount(name, followeeIdArray) {
    return knex('users').where('name', 'ilike', name).limit(1).select()
    .then(account => Promise.all(
          followeeIdArray.map(f =>
            knex('user_follows').insert({ follower_id: account[0].id, followee_id: f })
          )
        ));
  }

  return Promise.resolve(
    createSystemFeeds()
      .then(() => fillProposalsFeed(proposalFeedID, numActivitiesPerFeed))
      .then(() => fillStatementsFeed(statementFeedID, numActivitiesPerFeed))
      .then(() => fillUserFeed(8))
      .then(() => fillUserFeed(9))
      .then(() => fillUserFeed(10))
      .then(() => fillUserFeed(11))
      .then(() => createFolloweesForAccount('user_0', [8, 9, 10, 11]))
  );
};
