const faker = require('faker');
const FakerBase = require('./FakerBase');

class StatementFaker extends FakerBase {
  constructor(props, knex) {
    super(props, knex);
    this.statementsDB = this.initBatcher(data =>
      knex.batchInsert('statements', data).returning('*'),
    );
  }

  create({ poll, votes }, amount) {
    const statementPromises = [];
    for (let i = 0; i < amount; i += 1) {
      // TODO make sure user has voted only once! ()downvotes
      const stopTime = this.atLatestNow(poll.end_time);

      const vote = votes[i];
      statementPromises.push(
        this.statementsDB.insert({
          author_id: vote.user_id,
          vote_id: vote.id,
          poll_id: vote.poll_id,
          body: faker.lorem.paragraphs(this.random(1, 4)),
          created_at: this.getDateBetween(vote.created_at, stopTime),
        }),
      );
    }
    return statementPromises;
  }
}

module.exports = StatementFaker;
