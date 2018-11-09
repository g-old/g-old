const faker = require('faker');
const FakerBase = require('./FakerBase');
const PollFaker = require('./PollFaker');
const VoteFaker = require('./VoteFaker');
const StatementFaker = require('./StatementFaker');

class ProposalBase extends FakerBase {
  constructor(props, knex) {
    super(props, knex);
    this.proposalsDB = this.initBatcher(data =>
      knex.batchInsert('proposals', data).returning('*'),
    );
    this.authorIds = props.authorIds;
    this.faker = {
      poll: new PollFaker({ numVoter: props.numVoter }, knex),
      vote: new VoteFaker(props, knex),
      statement: new StatementFaker(props, knex),
    };
  }

  get randomAuthor() {
    return this.authorIds[this.random(0, this.authorIds.length - 1)];
  }

  insertProposal(data) {
    return this.proposalsDB.insert({
      ...data,
      author_id: this.randomAuthor,
      title: faker.lorem.sentence(),
      body: faker.lorem.paragraphs(this.random(1, 7)),
    });
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
}

module.exports = ProposalBase;
