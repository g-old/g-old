const ProposalBase = require('./ProposalBase');

class AcceptedFaker extends ProposalBase {
  constructor(props, knex) {
    super(props, knex);
    this.state = 'accepted';
  }

  createProposal(pollingModes, type) {
    const [proposed, voting] = pollingModes;
    switch (type) {
      case 'phaseOne':
        return this.faker.poll.createClosedPoll(proposed, type).then(poll =>
          this.createVotesAndStatements(poll, proposed).then(() =>
            this.insertProposal({
              created_at: new Date(poll.created_at),
              state: this.state,
              poll_one_id: poll.id,
            }),
          ),
        );

      case 'phaseTwo':
        return this.faker.poll
          .createClosedPollPair(pollingModes, 'accepted')
          .then(([pollOne, pollTwo]) =>
            Promise.all([
              this.createVotesAndStatements(pollOne, proposed),
              this.createVotesAndStatements(pollTwo, voting),
            ]).then(() =>
              this.insertProposal({
                author_id: this.randomAuthor,
                poll_one_id: pollOne.id,
                poll_two_id: pollTwo.id,
                state: this.state,
                created_at: new Date(proposed.created_at),
              }),
            ),
          );

      default:
        throw new Error('Not implemented');
    }
  }

  create(pollingModes, amount) {
    const resultPromises = [];
    for (let i = 0; i < amount; i += 1) {
      let type = 'phaseOne';
      if (i < amount / 2) {
        type = 'phaseTwo';
      }
      const proposalPromise = this.createProposal(pollingModes, type);
      resultPromises.push(proposalPromise);
    }
    return resultPromises;
  }
}

module.exports = AcceptedFaker;
