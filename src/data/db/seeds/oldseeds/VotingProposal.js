const ProposalBase = require('./ProposalBase');

class VotingProposal extends ProposalBase {
  constructor(props, knex) {
    super(props, knex);
    this.state = 'voting';
  }

  createProposal(pollingModes) {
    // phase one
    // phase two
    const [phaseOne, phaseTwo] = pollingModes;
    return this.faker.poll.createPair(pollingModes).then(([proposed, voting]) =>
      Promise.all([
        this.createVotesAndStatements(proposed, phaseOne),
        this.createVotesAndStatements(voting, phaseTwo),
      ]).then(() =>
        this.insertProposal({
          author_id: this.randomAuthor,
          poll_one_id: proposed.id,
          poll_two_id: voting.id,
          state: this.state,
          created_at: proposed.created_at,
        }),
      ),
    );
  }

  create(pollingModes, amount) {
    const resultPromises = [];

    for (let i = 0; i < amount; i += 1) {
      const type = 'voted';
      const proposalPromise = this.createProposal(pollingModes, type);
      resultPromises.push(proposalPromise);
    }
    return resultPromises;
  }
}

module.exports = VotingProposal;
