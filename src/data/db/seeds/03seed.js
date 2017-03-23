/* eslint-disable comma-dangle */
const numProposalsToCorrect = 5;

function randomNumber(max) {
  return Math.floor(max * Math.random());
}

// https://www.frankmitchell.org/2015/01/fisher-yates/
/* eslint-disable no-param-reassign */

const thresholdInVotes = (pollOne) =>
  Math.floor((pollOne.num_voter / 100) * pollOne.threshold);

const calcNewThreshold = (poll) =>
  Math.floor((poll.upvotes * 100) / poll.num_voter);

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
    updates.push(knex('polls').where({ id: pollTwo.id }).update({
      upvotes: 0,
      downvotes: 0,
      start_time: null,
      end_time: null,
      closed_at: null }));

    // update end_time
    updates.push(knex('polls').where({ id: pollOne.id }).update({ end_time: dates.endDate }));
    return updates;
  };

  const correctVoting = (pollOne) => {
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
      knex('polls')
        .where({ id: pollOne.id })
        .update({
          start_time: dates.startDate,
          created_at: dates.startDate,
          end_time: dates.endDate,
          closed_at: dates.endDate })
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
      updates.push(knex('polls').where({ id: pollTwo.id }).update({
        upvotes: 0,
        downvotes: 0,
        start_time: null,
        end_time: null,
        closed_at: null }));

      // correct dates on poll
      const updateFn = knex('polls')
        .where({ id: pollOne.id })
        .update({
          created_at: dates.startDate,
          start_time: dates.startDate,
          end_time: dates.endDate,
          closed_at: dates.closeDate,
        });
      updates.push(updateFn);
    } else {
      // pros must be over the threshold - delete con votes
      if (pollTwo.upvotes < pollTwo.downvotes) {
        const diff = pollTwo.downvotes - pollTwo.upvotes - 1;
        updates.push(knex('votes').where({ poll_id: pollTwo.id, position: 'con' }).limit(diff).del());
        updates.push(knex('polls').where({ id: pollTwo.id }).update({ upvotes: pollTwo.upvotes - diff }));
      }
      // correct dates on poll
      const updateFn = knex('polls')
        .where({ id: pollTwo.id })
        .update({ created_at: dates.startDate,
          start_time: dates.startDate,
          end_time: dates.endDate,
          closed_at: dates.endDate });
      updates.push(updateFn);
    }
    return updates;
  };

  const correctRejected = (pollOne, pollTwo) => {
    const numNeededVotes = thresholdInVotes(pollOne);
    const updates = [];
    const dates = getDates(true);
    if (pollOne.upvotes > numNeededVotes) {
      // rejected in phase 2
      // del pro votes
      if (pollTwo.upvotes >= pollTwo.downvotes) {
        const diff = (pollTwo.upvotes - pollTwo.downvotes) + 1;
        updates.push(knex('votes').where({ poll_id: pollTwo.id, position: 'pro' }).limit(diff).del());
        updates.push(knex('polls').where({ id: pollTwo.id }).update({ upvotes: pollTwo.upvotes - diff }));
      }
      // correct dates pollTwo

      updates.push(
        knex('votes')
          .where({ poll_id: pollTwo.id })
          .update({
            created_at: dates.startDate,
            start_time: dates.startDate,
            end_time: dates.endDate,
            closed_at: dates.endDate,
          })
      );
    } else {
      // rejected in phase 1
      // del votes from poll 2
      updates.push(knex('votes').where({ poll_id: pollTwo.id }).del());
      updates.push(knex('polls').where({ id: pollTwo.id }).update({
        upvotes: 0,
        downvotes: 0,
        start_time: null,
        end_time: null,
        closed_at: null }));
      updates.push(
        knex('polls')
          .where({ id: pollOne.id })
          .update({
            created_at: dates.startDate,
            start_time: dates.startDate,
            end_time: dates.endDate,
            closed_at: dates.endDate,
          })
      );
    }
    // dates
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
        .then(data => data)
    ];

    return Promise.all(proposals).then(data => data.reduce((a, b) => a.concat(b)));
  }
  return Promise.resolve(
    getProposals().then(data => mapData(data).then(arrayOfPollData => mapPolls(arrayOfPollData)))
  );
};
