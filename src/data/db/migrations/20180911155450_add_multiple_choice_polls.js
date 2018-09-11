const convertPoll = pollData => {
  const option = { order: 0, createdAt: new Date(), description: 'UP' };
  return { options: [pollData, option] };
};

const mapVoteEnumTo = () => {};

exports.up = function(knex, Promise) {
  // find all polls;
  const pollData = {};
  const voteData = {};

  const newVoteData = {};
  // const newPollData = {};

  const savePollData = polls =>
    new Promise(resolve => {
      console.info('Polls', { polls });
      polls.forEach(poll => {
        pollData[poll.id] = poll;
      });
      resolve(pollData);
    });

  const saveVoteData = votes =>
    new Promise(resolve => {
      console.info('votes', { votes });
      votes.forEach(vote => {
        voteData[vote.id] = vote;
      });
      resolve(voteData);
    });

  const addFields = () =>
    Promise.all([
      knex.schema.table('polls', table => {
        table.jsonb('options').defaultsTo('{}');
      }),
      knex.schema.alterTable('votes', table => {
        table.jsonb('position').alter();
      }),
    ]);

  const computeNewVoteData = () =>
    // default vote = 0
    // const UPVOTE = 1;
    // const DOWNVOTE = 0;

    Object.keys(voteData).reduce((acc, voteId) => {
      const vote = voteData[voteId];
      acc[voteId] = mapVoteEnumTo(vote);
      return acc;
    }, newVoteData);

  const computeNewPollData = () =>
    // pollschema = options:= [OPTIONS], num_votes = [VOTE_COUNT]
    // OPTIONS:= { id: OPTIONID, order: INT, createdAt: DATETIME, updatedAt: DATETIME, description: LANG}
    // OPTIONID:= PollId$Order
    // LANG:= {de:TEXT, it:TEXT, lld:TEXT}
    // VOTE_COUNT:=[UP, DOWN, NEUTRAL],
    // UP:= 1
    // DOWN:= 0
    // NEUTRAL:= 2

    Object.keys(pollData).reduce((acc, pollId) => {
      const poll = pollData[pollId];
      acc[pollId] = convertPoll(poll);
      return acc;
    }, newVoteData);

  const addNewData = () => {};
  return knex('polls')
    .select()
    .then(savePollData)
    .then(saveVoteData)
    .then(addFields)
    .then(computeNewPollData)
    .the(computeNewVoteData)
    .then(addNewData);
};

// exports.down = function(knex, Promise) {};
