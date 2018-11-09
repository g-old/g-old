const FakerBase = require('./FakerBase');

class VoteFaker extends FakerBase {
  constructor(props, knex) {
    super(props, knex);
    this.voteDB = this.initBatcher(data =>
      knex.batchInsert('votes', data).returning('*'),
    );
  }

  create(positions, { poll, voterIds }, amount) {
    const votePromises = [];
    const stopTime = this.atLatestNow(poll.end_time);
    for (let i = 0; i < amount; i += 1) {
      // TODO make sure user has voted only once! ()downvotes
      votePromises.push(
        this.voteDB.insert({
          user_id: voterIds.pop(),
          poll_id: poll.id,
          positions: JSON.stringify(positions),
          created_at: this.getDateBetween(poll.start_time, stopTime),
        }),
      );
    }
    return Promise.all(votePromises);
  }

  createUpvotes(props, amount) {
    return this.create([{ pos: 0, value: 1 }], props, amount);
  }

  createDownvotes(props, amount) {
    return this.create([{ pos: 1, value: 1 }], props, amount);
  }
}

module.exports = VoteFaker;
