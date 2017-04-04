/* eslint-disable comma-dangle */
const numProposalsToCorrect = 500;

function randomNumber(max) {
  return Math.floor(max * Math.random());
}

const thresholdInVotes = poll => Math.floor((poll.num_voter / 100) * poll.threshold);

const calcNewThreshold = poll => Math.floor((poll.upvotes * 100) / poll.num_voter);

const getDates = finished => {
  const date = new Date();
  const startDate = new Date();
  const endDate = new Date();
  const closeDate = new Date();
  const daysAgo = randomNumber(20) || 1;
  const daysToEnd = randomNumber(10) || 1;
  endDate.setDate(date.getDate() + (finished ? -daysToEnd : daysToEnd));
  closeDate.setDate(endDate.getDate() - daysAgo - (randomNumber(20) || 1));
  startDate.setDate(closeDate.getDate() - daysAgo);
  return {
    startDate,
    endDate,
    closeDate,
  };
};

/* eslint-enable no-param-reassign */
exports.seed = function (knex, Promise) {
  const correctProposed = (pollOne, pollTwo) => {
    const numNeededVotes = thresholdInVotes(pollOne);
    const oneVotePercentage = Math.floor(100 / pollOne.num_voter);
    const updates = [];
    const dates = getDates(false);
    if (pollOne.upvotes >= numNeededVotes) {
      // update threshold

      const newThreshold = calcNewThreshold(pollOne) + oneVotePercentage;
      updates.push(knex('polls').where({ id: pollOne.id }).update({ threshold: newThreshold }));
    }
    // delete all votes and statements from polltwo
    updates.push(knex('votes').where({ poll_id: pollTwo.id }).del());
    updates.push(
      knex('polls').where({ id: pollTwo.id }).update({
        upvotes: 0,
        downvotes: 0,
        start_time: null,
        end_time: null,
        closed_at: null,
      })
    );

    // update end_time
    updates.push(knex('polls').where({ id: pollOne.id }).update({ end_time: dates.endDate }));
    return updates;
  };

  const correctVoting = pollOne => {
    const numNeededVotes = thresholdInVotes(pollOne);
    const oneVotePercentage = Math.floor(100 / pollOne.num_voter);
    const updates = [];
    const dates = getDates(false);
    if (pollOne.upvotes <= numNeededVotes) {
      const newThreshold = calcNewThreshold(pollOne) - oneVotePercentage;
      updates.push(knex('polls').where({ id: pollOne.id }).update({ threshold: newThreshold }));
    }
    // nothing to do for pollTwo
    // update dates for pollOne
    updates.push(
      knex('polls').where({ id: pollOne.id }).update({
        start_time: dates.startDate,
        created_at: dates.startDate,
        end_time: dates.endDate,
        closed_at: dates.endDate,
      })
    );
    return updates;
  };

  const correctAccepted = (pollOne, pollTwo) => {
    const numNeededVotes = thresholdInVotes(pollOne);
    const updates = [];
    const dates = getDates(true);
    if (pollOne.upvotes <= numNeededVotes) {
      // delete all votes and statements from polltwo
      updates.push(knex('votes').where({ poll_id: pollTwo.id }).del());
      updates.push(
        knex('polls').where({ id: pollTwo.id }).update({
          upvotes: 0,
          downvotes: 0,
          start_time: null,
          end_time: null,
          closed_at: null,
        })
      );

      // correct dates on poll
      const updateFn = knex('polls').where({ id: pollOne.id }).update({
        created_at: dates.startDate,
        start_time: dates.startDate,
        end_time: dates.endDate,
        closed_at: dates.closeDate,
      });
      updates.push(updateFn);
    } else {
      // check against threshold
      const actualThreshold = Math.floor(
        ((pollTwo.upvotes + pollTwo.downvotes) / 100) * pollTwo.threshold
      );
      if (pollTwo.upvotes <= actualThreshold) {
        // get diff
        const numDownvotes = Math.max(
          Math.floor((pollTwo.upvotes * 100) / pollTwo.threshold) - pollTwo.upvotes - 1,
          0
        );
        const diff = pollTwo.downvotes <= numDownvotes ? 0 : pollTwo.downvotes - numDownvotes;
        updates.push(
          knex('votes').where({ poll_id: pollTwo.id, position: 'con' }).limit(diff).del()
        );
        updates.push(
          knex('polls').where({ id: pollTwo.id }).update({
            downvotes: pollTwo.downvotes - diff,
            num_voter: (pollTwo.upvotes + pollTwo.downvotes) - diff,
          })
        );
      }

      // correct dates on poll
      const updateFn = knex('polls').where({ id: pollTwo.id }).update({
        created_at: dates.startDate,
        start_time: dates.startDate,
        end_time: dates.endDate,
        closed_at: dates.endDate,
      });
      updates.push(updateFn);
    }
    return updates;
  };

  const correctRejected = (pollOne, pollTwo) => {
    const numNeededVotes = thresholdInVotes(pollOne);
    const updates = [];
    const dates = getDates(true);
    if (pollOne.upvotes < numNeededVotes) {
      // lower threshold
      const oneVotePercentage = Math.floor(100 / pollOne.num_voter);
      const newThreshold = calcNewThreshold(pollOne) - oneVotePercentage;
      updates.push(knex('polls').where({ id: pollOne.id }).update({ threshold: newThreshold }));
      const pollOneDates = getDates(true);
      // set dates
      updates.push(
        knex('polls').where({ id: pollOne.id }).update({
          start_time: pollOneDates.startDate,
          end_time: pollOneDates.endDate,
          closed_at: pollOneDates.closeDate,
        })
      );
    }
    // Rejection only possible if not enough  pro-votes
    {
      // rejected in phase 2
      // more cons then pros needed  del pro votes
      const actualThreshold = Math.floor(
        ((pollTwo.upvotes + pollTwo.downvotes) / 100) * pollTwo.threshold
      );
      if (pollTwo.upvotes >= actualThreshold) {
        // set new threshold
        const numVoters = pollTwo.upvotes + pollTwo.downvotes;
        if (numVoters > 0) {
          const higherThreshold = Math.floor((pollTwo.upvotes * 100)
         / numVoters)
        + Math.floor(100 / numVoters);
          updates.push(knex('polls').where({ id: pollTwo.id }).update({ threshold: higherThreshold, num_voter: pollTwo.upvotes + pollTwo.downvotes }));
        }
      }
    }

    // correct dates pollTwo

    updates.push(
      knex('polls').where({ id: pollTwo.id }).update({
        created_at: dates.startDate,
        start_time: dates.startDate,
        end_time: dates.endDate,
        closed_at: dates.endDate,
      })
    );

    // dates
    return updates;
  };

  function correct(data) {
    const states = {
      proposed: correctProposed,
      voting: correctVoting,
      accepted: correctAccepted,
      rejected: correctRejected,
    };
    return states[data.state](data.pollOne[0], data.pollTwo[0]) || [];
  }

  function correctPolls(data) {
    const updates = correct(data);
    return Promise.resolve(Promise.all(updates));
  }

  function mapData(proposalData) {
    return new Promise(resolve => {
      const queries = [];
      const updates = [];
      proposalData.forEach(proposal => {
        queries.push(
          Promise.all([
            knex('polls').where({ id: proposal.poll_one_id }).select(),
            knex('polls').where({ id: proposal.poll_two_id }).select(),
          ]).then(polls => ({ pollOne: polls[0], pollTwo: polls[1], state: proposal.state }))
        );
        updates.push(
          knex('proposals')
            .where({ id: proposal.id })
            .update({ title: `__REAL__ ${proposal.title}` })
        );
      });

      Promise.all(updates).then();
      Promise.all(queries).then(data => resolve(data));
      Promise.all([Promise.all(updates).then(), Promise.all(queries).then(data => resolve(data))]);
    });
  }

  function mapPolls(pollData) {
    return new Promise(resolve => {
      const corrections = [];
      pollData.forEach(poll => {
        const corrected = correctPolls(poll);
        corrections.push(corrected);
      });
      Promise.all(corrections).then(data => resolve(data));
    });
  }

  function getProposals() {
    const proposals = [
      knex('proposals')
        .where({ state: 'proposed' })
        .limit(numProposalsToCorrect)
        .select()
        .then(data => data),
      knex('proposals')
        .where({ state: 'voting' })
        .limit(numProposalsToCorrect)
        .select()
        .then(data => data),
      knex('proposals')
        .where({ state: 'accepted' })
        .limit(numProposalsToCorrect)
        .select()
        .then(data => data),
      knex('proposals')
        .where({ state: 'rejected' })
        .limit(numProposalsToCorrect)
        .select()
        .then(data => data),
    ];

    return Promise.all(proposals).then(data => data.reduce((a, b) => a.concat(b)));
  }
  return Promise.resolve(
    getProposals().then(data => mapData(data).then(arrayOfPollData => mapPolls(arrayOfPollData)))
  );
};
