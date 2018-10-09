const convertPoll = pollData => {
  // differentiate phase one and phase two
  // unipolar === false
  const { unipolar, upvotes, downvotes, ...rest } = pollData;
  const result = { ...rest };
  if (unipolar) {
    const wantVotingOption = {
      pos: 0,
      order: 0,
      description: { _default: 'up' },
      numVotes: upvotes,
    };
    result.options = [wantVotingOption];
  } else {
    const downVotingOption = {
      pos: 1,
      order: 1,
      description: { _default: 'down' },
      numVotes: downvotes,
    };
    const upVotingOption = {
      pos: 0,
      order: 0,
      description: { _default: 'up' },
      numVotes: upvotes,
    };
    result.options = [upVotingOption, downVotingOption];
    // result.num_votes = [downvotes, upvotes];
  }

  return result;
};
const SELECTION = 1;
const convertPosition = position => {
  const res = [];
  if (position === 'pro') {
    res.push({ pos: 0, value: SELECTION });
  } else res.push({ pos: 1, value: SELECTION });
  return res;
};

const mapVoteEnumTo = voteData => {
  const { position, ...rest } = voteData;
  return {
    ...rest,
    positions: convertPosition(voteData.position),
  };
};

const convertActivity = (activity, voteData) => ({
  content: voteData[activity.object_id],
});

exports.up = function(knex, Promise) {
  const voteData = {};
  const activityData = {};
  const pollData = {};
  const newActivityData = {};
  const newVoteData = {};
  const newPollData = {};
  // find all polls;

  const savePollData = polls =>
    new Promise(resolve => {
      console.info('Polls', { polls });
      polls.forEach(poll => {
        pollData[poll.id] = poll;
      });
      resolve(activityData);
    });

  const saveVoteData = votes =>
    new Promise(resolve => {
      console.info('votes', { votes });
      votes.forEach(vote => {
        voteData[vote.id] = vote;
      });
      resolve(voteData);
    });

  const saveActivityData = () =>
    knex('activities')
      .where({ type: 'vote' })
      .select()
      .then(activities => {
        activities.forEach(activity => {
          activityData[activity.id] = activity;
        });
      });

  const getVoteData = () => knex('votes').select();
  const addFields = () =>
    Promise.all([
      knex.schema.table('polls', table => {
        table.jsonb('options').defaultsTo('{}');
        table.boolean('multiple_choice').defaultsTo('false');
        table.dropColumn('upvotes');
        table.dropColumn('downvotes');
        table.boolean('extended').defaultsTo(false); // m.choice
      }),
      knex.schema.table('votes', table => {
        table.dropColumn('position');
        table.jsonb('positions').defaultsTo('[]');
      }),
      knex.schema.table('statements', table => {
        table.dropColumn('position');
      }),
    ]);

  const computeNewVoteData = () => {
    Object.keys(voteData).reduce((acc, voteId) => {
      const vote = voteData[voteId];
      acc[voteId] = mapVoteEnumTo(vote);
      return acc;
    }, newVoteData);
    return Promise.resolve(newVoteData);
  };

  const computeNewPollData = () => {
    Object.keys(pollData).reduce((acc, pollId) => {
      const poll = pollData[pollId];
      acc[pollId] = convertPoll(poll);
      return acc;
    }, newPollData);
    return Promise.resolve(newPollData);
  };

  const computeNewActivityData = () => {
    Object.keys(activityData).reduce((acc, activityId) => {
      const activity = activityData[activityId];
      acc[activityId] = convertActivity(activity, newVoteData);
      return acc;
    }, newActivityData);
    return Promise.resolve(newActivityData);
  };

  const addNewData = () => {
    // update votes
    const votePromises = [];
    Object.keys(newVoteData).forEach(voteId => {
      const vote = newVoteData[voteId];
      votePromises.push(
        knex('votes')
          .update({
            positions: JSON.stringify(vote.positions),
          })
          .where({ id: voteId }),
      );
    });
    // update polls
    const pollPromises = [];
    Object.keys(newPollData).forEach(pollId => {
      const poll = newPollData[pollId];
      pollPromises.push(
        knex('polls')
          .update({ options: JSON.stringify(poll.options) })
          .where({ id: pollId }),
      );
    });
    // update activities
    const activityPromises = [];
    Object.keys(newActivityData).forEach(activityId => {
      const activity = newActivityData[activityId];
      if (!activity) {
        throw new Error();
      }
      activityPromises.push(
        knex('activities')
          .update({ content: JSON.stringify(activity.content) })
          .where({ id: activityId }),
      );
    });
    return Promise.all([...votePromises, ...pollPromises, ...activityPromises]);
  };
  return knex('polls')
    .join('polling_modes', { 'polls.polling_mode_id': 'polling_modes.id' })
    .select(['polls.*', 'polling_modes.unipolar as unipolar'])
    .then(savePollData)
    .then(getVoteData)
    .then(saveVoteData)
    .then(saveActivityData)
    .then(addFields)
    .then(computeNewPollData)
    .then(computeNewVoteData)
    .then(computeNewActivityData)
    .then(addNewData);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('polls', table => {
      table.dropColumn('options');
      table.dropColumn('multiple_choice');
      table.integer('upvotes');
      table.integer('downvotes');
      table.dropColumn('extended');
    }),
    knex.schema.table('votes', table => {
      table.dropColumn('positions');
      table.enu('position', ['pro', 'con']);
    }),
    knex.schema.table('statements', table => {
      table.enu('position', ['pro', 'con']);
    }),
  ]);
};
