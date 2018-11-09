const ProposalBase = require('./ProposalBase');

class ProposedProposal extends ProposalBase {
  constructor(props, knex) {
    super(props, knex);
    this.pollingModeId = props.pollingModeId;
    this.numVoter = props.numVoter;
    this.state = 'proposed';
    this.authorIds = props.authorIds;
  }

  createStatements(votes, poll, pollingMode) {
    if (pollingMode.with_statements) {
      const engagement = this.random(1, this.authorIds.length);
      const numStatements = Math.floor((votes.length * engagement) / 100);
      const voteData = [...votes];
      this.shuffle(voteData);
      return this.faker.statement.create(
        { votes: voteData, poll },
        numStatements,
      ); // TODO statementlikes
    }
    return Promise.resolve();
  }

  createVotesAndStatements(poll, pollingMode) {
    const voters = [...this.authorIds];
    this.shuffle(voters);
    if (pollingMode.unipolar) {
      return this.faker.vote
        .createUpvotes({ poll, voterIds: voters }, poll.options[0].numVotes)
        .then(votes => this.createStatements(votes, poll, pollingMode));
    }
    // up/downvotes
    return this.faker.vote
      .createUpvotes({ poll, voterIds: voters })
      .then(upvotes =>
        this.faker.vote
          .createDownvotes({ poll, voterIds: voters })
          .then(downvotes =>
            this.createStatements(
              [...upvotes, ...downvotes],
              poll,
              pollingMode,
            ),
          ),
      );
  }

  createDependingResources(poll, pollingMode) {
    const voters = [...this.authorIds];
    this.shuffle(voters);
    if (pollingMode.unipolar) {
      return this.faker.vote
        .createUpvotes({ poll, voterIds: voters }, poll.options[0].numVotes)
        .then(votes => {
          if (pollingMode.with_statements) {
            const engagement = this.random(1, voters.length);
            const numStatements = Math.floor((votes.length * engagement) / 100);
            const voteData = [...votes];
            this.shuffle(voteData);
            return this.faker.statement.create(
              { votes: voteData, poll },
              numStatements,
            ); // TODO statementlikes
          }
          return Promise.resolve();
        }) // create statements
        .then(() =>
          this.insertProposal({
            poll_one_id: poll.id,
            created_at: poll.created_at,
            state: this.state,
          }),
        );
    }
    return this.faker.vote
      .createUpvotes({ poll }, poll.options[0].numVotes)
      .then(() =>
        this.faker.createDownvotes(
          { pollId: poll.id },
          poll.options[1].numVotes,
        ),
      )
      .then(votes => votes)
      .then(() =>
        this.insertProposal({
          poll_one_id: poll.id,
          created_at: poll.created_at,
          state: this.state,
        }),
      );
  }

  createProposal(pollingMode, type) {
    switch (type) {
      case 'voted':
        return this.faker.poll
          .createVotedPoll(pollingMode)
          .then(poll => this.createDependingResources(poll, pollingMode));

      default:
        throw new Error('Not implemented');
    }
  }

  create(pollingMode, amount) {
    const resultPromises = [];

    for (let i = 0; i < amount; i += 1) {
      const type = 'voted';
      const proposalPromise = this.createProposal(pollingMode, type);
      resultPromises.push(proposalPromise);
    }
    return resultPromises;
  }
}

module.exports = ProposedProposal;
