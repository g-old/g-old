const DataBatcher = require('./DataBatcher');

class NumberGenerator {
  constructor(props) {
    this.min = props.min || 0;
    this.max = props.max || 100;
  }

  gen(min, max) {
    return Math.floor(
      Math.random() * ((max || this.max) - (min || this.min) + 1) + min ||
        this.min,
    );
  }
}

class FakerBase {
  constructor(props, knex) {
    this.rng = new NumberGenerator(props);
    this.db = knex;
  }

  // eslint-disable-next-line class-methods-use-this
  initBatcher(fn) {
    return new DataBatcher(fn);
  }

  random(min, max) {
    return this.rng.gen(min, max);
  }

  getFutureDate(date, maxDistance = 10) {
    const newDate = date ? new Date(date) : new Date();
    return newDate.setDate(newDate.getDate() + this.random(1, maxDistance));
  }

  getPastDate(date, maxDistance = 10) {
    const newDate = date || new Date();
    return newDate.setDate(newDate.getDate() - this.random(1, maxDistance));
  }

  // Does this work?
  getDateBetween(start, end) {
    const from = new Date(start);
    const to = new Date(end);
    return new Date(this.random(from.getTime(), to.getTime()));
  }

  // eslint-disable-next-line class-methods-use-this
  atLatestNow(endTime) {
    return new Date(endTime).getTime() > new Date().getTime()
      ? new Date()
      : new Date(endTime);
  }

  // eslint-disable-next-line class-methods-use-this
  shuffle(array) {
    // in place!
    let i = 0;
    let j = 0;
    let temp = null;
    for (i = array.length - 1; i > 0; i -= 1) {
      j = Math.floor(Math.random() * (i + 1));
      temp = array[i];
      // eslint-disable-next-line no-param-reassign
      array[i] = array[j];
      // eslint-disable-next-line no-param-reassign
      array[j] = temp;
    }
  }
}

module.exports = FakerBase;
