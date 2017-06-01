const faker = require('faker');
const bcrypt = require('bcrypt');

const numUsers = 50;
const numMods = numUsers / 10 > 0 ? numUsers / 10 : 1;
const numTestUsers = numMods;
const numTestGuests = 2;
const numGuests = numMods;
const numUsersWithFollowees = Math.floor((numUsers / 10) * 7);
const numTags = 10;
const maxNumFollowees = 5;
const numPolls = 200;
const numProposals = numPolls / 2;
const statementPercentage = 30; // how many of the voters have written a statement

const chunkSize = 1000;

function randomNumber(max) {
  return Math.floor(max * Math.random());
}
function random(array) {
  return array[Math.floor(array.length * Math.random())];
}
const dedup = (arr) => {
  const hashTable = {};

  return arr.filter((el) => {
    const key = JSON.stringify(el);
    const match = Boolean(hashTable[key]);

    return match ? false : (hashTable[key] = true);
  });
};

// https://www.frankmitchell.org/2015/01/fisher-yates/
/* eslint-disable no-param-reassign */
function shuffle(array) {
  // in place!
  let i = 0;
  let j = 0;
  let temp = null;
  for (i = array.length - 1; i > 0; i -= 1) {
    j = Math.floor(Math.random() * (i + 1));
    temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}
/* eslint-enable no-param-reassign */

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

  function createUser(name, surname, passwordHash, email, roleId, time, emailValidated, privilege) {
    return knex('users').insert({
      name,
      surname,
      password_hash: passwordHash,
      email,
      role_id: roleId,
      created_at: time,
      updated_at: time,
      email_validated: emailValidated,
      privilege: privilege || 1,
      avatar_path: `https://api.adorable.io/avatars/32/${name}${surname}.io.png`,
    });
  }

  /* eslint-disable prefer-template */
  function createUsers() {
    const time = new Date();
    let users = [];
    const testAdmin = Promise.resolve(
      bcrypt
        .hash('password', 10)
        .then(hash => createUser('admin', 'admin', hash, 'admin@example.com', 1, time, true, 1023))
    );
    users.push(testAdmin);
    const testMods = [];
    for (let i = 0; i < numMods; i += 1) {
      const name = 'mod_' + i;
      testMods.push(
        Promise.resolve(
          bcrypt
            .hash('password', 10)
            .then(hash => createUser(name, name, hash, name + '@example.com', 2, time, true))
        )
      );
    }
    users = users.concat(testMods);
    const testUsers = [];
    for (let i = 0; i < numTestUsers; i += 1) {
      const name = 'user_' + i;
      testUsers.push(
        Promise.resolve(
          bcrypt
            .hash('password', 10)
            .then(hash => createUser(name, name, hash, name + '@example.com', 3, time, true))
        )
      );
    }
    users = users.concat(testUsers);
    const numUsersCalculated = numUsers - numMods - 1 - numTestUsers - numTestGuests - numGuests;
    for (let i = 0; i < numUsersCalculated; i += 1) {
      const name = faker.name.firstName();
      const surname = faker.name.lastName();
      const user = createUser(name, surname, null, faker.internet.email(), 3, time, true);
      users.push(user);
    }

    const testGuests = [];
    let guestUsers = [];
    for (let i = 0; i < numTestGuests; i += 1) {
      const name = 'guest_' + i;
      testGuests.push(
        Promise.resolve(
          bcrypt
            .hash('password', 10)
            .then(hash => createUser(name, name, hash, name + '@example.com', 5, time, true))
        )
      );
    }
    /* eslint-enable prefer-template */
    guestUsers = guestUsers.concat(testGuests);

    for (let i = 0; i < numGuests; i += 1) {
      const name = faker.name.firstName();
      const surname = faker.name.lastName();
      const guest = createUser(
        name,
        surname,
        null,
        faker.internet.email(),
        5,
        time,
        Math.random() > 0.5
      );
      guestUsers.push(guest);
    }

    // returns only ids of users who can vote
    return Promise.resolve(
      Promise.all(guestUsers).then(() =>
        Promise.all(users).then(() =>
          knex('users').whereNot('role_id', 4).pluck('id').then(userIds => userIds)))
    );
  }

  function createFollowees() {
    return knex('users').pluck('id').then((userIds) => {
      const users = userIds.slice(0);
      shuffle(users);
      const time = new Date();
      const followeeData = [];
      for (let i = 0; i < numUsersWithFollowees; i += 1) {
        const followerId = users.pop();
        const numFollowees = Math.max(1, randomNumber(maxNumFollowees));
        const followees = userIds.slice(0);
        shuffle(followees);

        for (let j = 0; j < numFollowees; j += 1) {
          let followeeId = followees.pop();
          followeeId = followeeId === followerId ? followees.pop() : followeeId;

          const data = {
            follower_id: followerId,
            followee_id: followeeId,
            created_at: time,
            updated_at: time,
          };
          followeeData.push(data);
        }
      }
      return Promise.resolve(knex('user_follows').insert(followeeData));
    });
  }

  function createTags() {
    let tags = [];
    for (let i = 0; i < numTags; i += 1) {
      tags.push({ text: faker.lorem.word() });
    }
    tags = dedup(tags);
    return Promise.resolve(knex('tags').insert(tags).returning('id').then(ids => ids));
  }

  function createProposalTags(tagIds) {
    return Promise.resolve(
      knex('proposals').pluck('id').then((proposalIds) => {
        const time = new Date();
        const tagsData = [];

        const tagCounter = {};
        for (let i = 0; i < proposalIds.length; i += 1) {
          const numTagsOnProposal = randomNumber(tagIds.length);
          const tags = tagIds.slice(0);
          shuffle(tags);
          for (let j = 0; j < numTagsOnProposal; j += 1) {
            const tagId = tags.pop();
            const data = {
              proposal_id: proposalIds[i],
              tag_id: tagId,
              created_at: time,
              updated_at: time,
            };
            tagCounter[tagId] = tagCounter[tagId] ? tagCounter[tagId] + 1 : 1;
            tagsData.push(data);
          }
        }

        return knex('proposal_tags').insert(tagsData).then(() => {
          const updates = [];
          // eslint-disable-next-line no-restricted-syntax
          for (const id in tagCounter) {  // eslint-disable-line guard-for-in
            updates.push(knex('tags').where({ id }).update({ count: tagCounter[id] }));
          }

          return Promise.resolve(Promise.all(updates));
        });
      })
    );
  }

  function updatePolls(pollCounts) {
    const updates = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const id in pollCounts) { // eslint-disable-line guard-for-in
      updates.push(knex('polls').where({ id }).update(pollCounts[id]));
    }

    return Promise.resolve(Promise.all(updates).then(x => x));
  }

  function createStatementLikes({ stmtIds, stmtData, userIds }) {
    if (stmtData.length !== stmtIds.length) throw Error('Inconsistent data');

    let numLikes;
    const likes = [];
    const updates = [];
    const time = new Date();
    for (let i = 0; i < stmtIds.length; i += 1) {
      numLikes = randomNumber(userIds.length / 2);

      updates.push(knex('statements').where({ id: stmtIds[i] }).update({ likes: numLikes }));
      const users = userIds.slice(0);
      shuffle(users);
      for (let j = 0; j < numLikes; j += 1) {
        const like = {
          user_id: users.pop(),
          statement_id: stmtIds[i],
          created_at: time,
          updated_at: time,
        };
        likes.push(like);
      }
    }

    return Promise.resolve(
      knex
        .batchInsert('statement_likes', likes, chunkSize)
        .then(() => Promise.all(updates).then(data => data))
    );
  }

  function createStatements({ voteIds, voteData, userIds }) {
    if (voteIds.length !== voteData.length) throw Error('Inconsistent data');
    const statements = [];
    const numStatements = Math.floor((voteIds.length * statementPercentage) / 100);
    const time = new Date();
    for (let i = 0; i < numStatements; i += 1) {
      const statement = {
        author_id: voteData[i].user_id,
        vote_id: voteIds[i],
        poll_id: voteData[i].poll_id,
        body: faker.lorem.paragraphs(randomNumber(3) || 1),
        position: voteData[i].position,
        created_at: time,
        updated_at: time,
      };
      statements.push(statement);
    }
    return Promise.resolve(
      knex
        .batchInsert('statements', statements, chunkSize)
        .returning('id')
        .then(stmtIds => ({ stmtIds, stmtData: statements, userIds }))
    );
  }

  function createVotes({ userIds, pollData }) {
    let numVotes = 0;
    let time = null;
    const userVotes = [];
    const votesWithStatement = [];
    const pollOneVoteCount = {};
    const pollTwoVoteCount = {};
    const voteProposedFull = pollData[0].slice(0);
    const voteVotablesFull = pollData[1].slice(0);
    for (let i = 0; i < userIds.length; i += 1) {
      const voteProposed = voteProposedFull.slice(0);
      const voteVotables = voteVotablesFull.slice(0);

      // phase one polls;
      numVotes = randomNumber(voteProposed.length);
      // TODO shuffle array
      time = new Date();
      shuffle(voteProposed);

      for (let j = 0; j < numVotes; j += 1) {
        const pollId = voteProposed.pop();
        pollOneVoteCount[pollId] = pollOneVoteCount[pollId]
          ? { upvotes: pollOneVoteCount[pollId].upvotes + 1 }
          : { upvotes: 1 };
        const vote = {
          user_id: userIds[i],
          poll_id: pollId,
          position: 'pro',
          created_at: time,
          updated_at: time,
        };
        userVotes.push(vote);
      }

      numVotes = randomNumber(voteVotables.length / 2);
      time = new Date();
      shuffle(voteVotables);

      for (let x = 0; x < numVotes; x += 1) {
        const position = Math.random() < 0.5 ? 'pro' : 'con';
        const column = ['upvotes', 'downvotes'];
        const index = position === 'pro' ? 0 : 1;

        const pollTwoId = voteVotables.pop();
        // TODO make with Object.assign
        pollTwoVoteCount[pollTwoId] = pollTwoVoteCount[pollTwoId]
          ? {
            [column[index]]: pollTwoVoteCount[pollTwoId][column[index]] + 1,
            [column[1 - index]]: pollTwoVoteCount[pollTwoId][column[1 - index]],
          }
          : { [column[index]]: 1, [column[1 - index]]: 0 };

        const vote = {
          user_id: userIds[i],
          poll_id: pollTwoId,
          position,
          created_at: time,
          updated_at: time,
        };
        votesWithStatement.push(vote);
      }
    }

    // create votes
    return Promise.resolve(
      Promise.all([
        knex.batchInsert('votes', userVotes, chunkSize).returning('id'),
        knex.batchInsert('votes', votesWithStatement, chunkSize).returning('id'),
      ])
        .then(voteIds =>
          updatePolls(pollOneVoteCount)
            .then(() => updatePolls(pollTwoVoteCount))
            .then(() => Promise.resolve(voteIds)))
        .then(voteIds => ({ voteIds: voteIds[1], voteData: votesWithStatement, userIds }))
    );
  }

  function createProposals(userIds, pollData) {
    const pollOneIds = pollData[0].slice(0);
    const pollTwoIds = pollData[1].slice(0);
    const proposedProposal = [];
    const votableProposals = [];
    const acceptedProposals = [];
    const rejectedProposals = [];
    const revokedProposals = [];
    // TODO check numProposals isn't to high

    shuffle(pollOneIds);
    shuffle(pollTwoIds);
    for (let i = 0; i < numProposals; i += 1) {
      const time = new Date();

      const proposal = {
        author_id: random(userIds),
        poll_one_id: pollOneIds.pop(),
        poll_two_id: pollTwoIds.pop(),
        title: faker.lorem.sentence(),
        body: faker.lorem.paragraphs(randomNumber(10) || 4),
        created_at: time,
        updated_at: time,
      };
      if (i % 5 === 0) {
        proposedProposal.push(Object.assign({}, proposal, { state: 'proposed' }));
      } else if (i % 3 === 0) {
        votableProposals.push(Object.assign({}, proposal, { state: 'voting' }));
      } else if (i % 7 === 0) {
        rejectedProposals.push(Object.assign({}, proposal, { state: 'rejected' }));
      } else if (i % 9 === 0) {
        revokedProposals.push(Object.assign({}, proposal, { state: 'revoked' }));
      } else {
        acceptedProposals.push(Object.assign({}, proposal, { state: 'accepted' }));
      }
    }

    return Promise.resolve(
      Promise.all([
        knex.batchInsert('proposals', proposedProposal, chunkSize).returning('id'),
        knex.batchInsert('proposals', votableProposals, chunkSize).returning('id'),
        knex.batchInsert('proposals', acceptedProposals, chunkSize).returning('id'),
        knex.batchInsert('proposals', rejectedProposals, chunkSize).returning('id'),
        knex.batchInsert('proposals', revokedProposals, chunkSize).returning('id'),
      ]).then(data => ({ userIds, proposalIds: data, pollData }))
    );
  }

  function createPollingmodes() {
    const data = [
      { name: 'propose', unipolar: true, with_statements: false, threshold_ref: 'all' },
      { name: 'vote', unipolar: false, with_statements: true, threshold_ref: 'voters' },
    ];
    return Promise.resolve(
      knex('polling_modes')
        .insert(data)
        .returning('id')
        .then(ids => ({ proposeId: ids[0], voteId: ids[1] }))
    );
  }

  function createPolls({ proposeId, voteId }) {
    const phaseOnePolls = [];
    const phaseTwoPolls = [];
    let poll;
    let time;
    let endTime;
    for (let i = 0; i < numPolls; i += 1) {
      time = new Date();
      endTime = new Date();
      endTime.setDate(time.getDate() + randomNumber(10));
      poll = {
        secret: Math.random() > 0.5,
        threshold: randomNumber(100) || 20,
        created_at: time,
        updated_at: time,
        start_time: time,
        end_time: endTime,
        num_voter: numUsers - numGuests - numTestGuests,
      };
      if (i % 2 === 0) {
        poll = Object.assign({}, poll, { polling_mode_id: proposeId });
        phaseOnePolls.push(poll);
      } else {
        poll = Object.assign({}, poll, {
          polling_mode_id: voteId,
          threshold: poll.threshold < 50 ? 50 : poll.threshold,
        });
        phaseTwoPolls.push(poll);
      }
    }

    return Promise.resolve(
      Promise.all([
        knex.batchInsert('polls', phaseOnePolls, chunkSize).returning('id'),
        knex.batchInsert('polls', phaseTwoPolls, chunkSize).returning('id'),
      ]).then(ids => ids)
    );
  }

  return Promise.resolve(
    createRoles()
      .then(createPollingmodes)
      .then(createPolls)
      .then(pollData => createUsers().then(userIds => createProposals(userIds, pollData)))
      .then(createVotes)
      .then(createStatements)
      .then(createStatementLikes)
      .then(createFollowees)
      .then(createTags)
      .then(createProposalTags)
      .catch(e => console.log(e))
  );
};
