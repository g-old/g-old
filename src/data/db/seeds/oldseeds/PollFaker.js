const faker = require('faker');
const FakerBase = require('./FakerBase');

const isNotExtended = numOptions => numOptions === 1 || numOptions === 2;
class PollFaker extends FakerBase {
  constructor(props, knex) {
    super(props, knex);
    if (!props.numVoter) {
      throw new Error('Argument missing: numVoter');
    }
    this.pollsDB = this.initBatcher(data =>
      knex.batchInsert('polls', data).returning('*'),
    );
    this.numVoter = props.numVoter;
  }

  createOptions(numVotes, numOptions) {
    const result = [];
    let availableVotes = numVotes;
    for (let i = 0; i < numOptions; i += 1) {
      // if 1 opion, giv it all the votes
      // if 2, choose a random number
      let votes = this.random(1, availableVotes);
      if (i === numOptions - 1) {
        votes = availableVotes;
      }
      availableVotes -= votes;

      result.push({
        pos: i,
        numVotes: votes >= 0 ? votes : 0,
        order: i,
        description: this.createDescription(numOptions, i),
        title: isNotExtended(numOptions) ? '' : faker.lorem.sentence(),
      });
    }
    return result;
  }

  createDescription(optionCount, pos) {
    if (isNotExtended(optionCount)) {
      return { _default: pos === 0 ? 'up' : 'down' };
    }
    return {
      _de: faker.lorem.paragraph(this.random(1, 6)),
    };
  }

  createPair([proposed, voting]) {
    return this.createClosedPoll(proposed).then(poll =>
      this.createVotedPoll(voting, poll).then(openPoll => [poll, openPoll]),
    );
  }

  computeNumberOfVotes(threshold, state, open) {
    // depends if closed or open...
    if (open) {
      switch (state) {
        case 'proposed': {
          const maxVotes = Math.floor((this.numVoter * threshold) / 100);
          return this.random(1, maxVotes);
        }
        case 'voting': {
          return this.random(1, this.numVoter);
        }

        default:
          throw new Error('Not implemented');
      }
    } else {
      // closed
      switch (state) {
        case 'proposed': {
          const minVotes = Math.floor((this.numVoter * threshold) / 100);
          return this.random(minVotes, this.numVoter);
        }
        case 'voting': {
          const engagement = this.random(1, this.numVoter);
          const minVotes = Math.floor((engagement * threshold) / 100);
          return this.random(minVotes, engagement);
        }

        default:
          throw new Error('Not implemented');
      }
    }
  }

  createClosedPoll(pollingMode) {
    const threshold = this.random(10, 90);
    const minVotes = Math.floor((this.numVoter * threshold) / 100);
    const numVotes = this.random(minVotes, this.numVoter);

    const endTime = new Date(this.getPastDate());
    const startTime = new Date(this.getPastDate(endTime));

    let upvotes = 0;
    let downvotes = 0;
    if (pollingMode.unipolar) {
      upvotes = numVotes;
    } else {
      downvotes = this.random(1, numVotes);
      upvotes = numVotes - downvotes;
    }

    const options = [
      { pos: 0, order: 0, description: { _default: 'up' }, numVotes: upvotes },
    ];
    if (!pollingMode.unipolar) {
      options.push({
        pos: 1,
        order: 1,
        description: { _default: 'down' },
        numVotes: downvotes,
      });
    }

    // if(clos)
    const pollData = {
      secret: false,
      threshold,
      polling_mode_id: pollingMode.id,
      created_at: startTime,
      start_time: startTime,
      end_time: endTime,
      closed_at: endTime,
      num_voter: this.numVoter,
      num_votes: numVotes,
      options: JSON.stringify(options),
    };
    return this.pollsDB.insert(pollData).then(data => data);
  }

  createClosedFailedPoll(pollingMode, poll) {
    const threshold = this.random(10, 90);
    const maxVotes = Math.floor((this.numVoter * threshold) / 100);
    const numVotes = this.random(1, maxVotes);

    const startTime = poll
      ? this.getFutureDate(new Date(poll.closed_at))
      : this.getPastDate();
    const endTime = new Date(this.getFutureDate(new Date(startTime)));

    // TODO unipolar, not unipolar, extended,
    const options = this.createOptions(numVotes, pollingMode.unipolar ? 1 : 2);
    const pollData = {
      secret: false,
      threshold,
      polling_mode_id: pollingMode.id,
      created_at: new Date(startTime),
      start_time: new Date(startTime),
      end_time: new Date(endTime),
      closed_at: new Date(endTime),
      num_voter: this.numVoter,
      num_votes: numVotes,
      options: JSON.stringify(options),
    };
    return this.pollsDB.insert(pollData).then(data => data);
  }

  createClosedSuccessfulPoll(pollingMode, poll) {
    const threshold = this.random(10, 90);
    const minVotes = Math.floor((this.numVoter * threshold) / 100);
    const numVotes = this.random(minVotes, this.numVoter);

    const startTime = poll
      ? this.getFutureDate(new Date(poll.closed_at))
      : this.getPastDate();
    const endTime = new Date(this.getFutureDate(new Date(startTime)));

    // TODO unipolar, not unipolar, extended,
    const options = this.createOptions(numVotes, pollingMode.unipolar ? 1 : 2);
    const pollData = {
      secret: false,
      threshold,
      polling_mode_id: pollingMode.id,
      created_at: new Date(startTime),
      start_time: new Date(startTime),
      end_time: new Date(endTime),
      closed_at: new Date(endTime),
      num_voter: this.numVoter,
      num_votes: numVotes,
      options: JSON.stringify(options),
    };
    return this.pollsDB.insert(pollData).then(data => data);
  }

  createClosedPollPair(pollingModes, state) {
    switch (state) {
      case 'accepted':
        return this.createClosedFailedPoll(pollingModes[0]).then(poll =>
          this.createClosedSuccessfulPoll(pollingModes[1], poll).then(pollTwo =>
            Promise.resolve([poll, pollTwo]),
          ),
        );

      default:
        throw new Error('Not implemented');
    }
  }

  createVotedPoll(pollingMode, poll) {
    const threshold = this.random(10, 90);
    const maxVotes = Math.floor((this.numVoter * threshold) / 100);
    const numVotes = this.random(1, maxVotes);

    const startTime = new Date(
      this.getFutureDate(poll ? new Date(poll.closed_at) : undefined),
    );
    const endTime = new Date(this.getFutureDate(new Date(startTime)));

    let upvotes = 0;
    let downvotes = 0;
    if (pollingMode.unipolar) {
      upvotes = numVotes;
    } else {
      downvotes = this.random(1, numVotes);
      upvotes = numVotes - downvotes;
    }

    const options = [
      {
        pos: 0,
        order: 0,
        description: { _default: 'up' },
        numVotes: upvotes,
      },
    ];
    if (!pollingMode.unipolar) {
      options.push({
        pos: 1,
        order: 1,
        description: { _default: 'down' },
        numVotes: downvotes,
      });
    }
    const pollData = {
      secret: false,
      threshold,
      polling_mode_id: pollingMode.id,
      created_at: startTime,
      start_time: startTime,
      end_time: endTime,
      num_voter: this.numVoter,
      num_votes: numVotes,
      options: JSON.stringify(options),
    };
    return this.pollsDB.insert(pollData).then(data => data);
  }
}

module.exports = PollFaker;
