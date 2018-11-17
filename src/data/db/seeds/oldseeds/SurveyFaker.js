const ProposalBase = require('./ProposalBase');

class SurveyFaker extends ProposalBase {
  constructor(props, knex) {
    super(props, knex);
    this.state = 'survey';
  }

  createSurvey(pollingMode, state) {
    switch (state) {
      // open surveys
      case 'survey':
        return this.faker.poll.createVotedPoll(pollingMode).then(poll =>
          this.createVotesAndStatements(poll, pollingMode).then(() =>
            this.insertProposal({
              author_id: this.randomAuthor,
              poll_one_id: poll.id,
              state: this.state,
              created_at: poll.created_at,
            }),
          ),
        );

      case 'extended':
        return this.faker.poll.createVotedPoll(pollingMode).then(poll =>
          this.createVotesAndStatements(poll, pollingMode).then(() =>
            this.insertProposal({
              author_id: this.randomAuthor,
              poll_one_id: poll.id,
              state: this.state,
              created_at: poll.created_at,
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
      const type = 'survey';
      const surveyPromise = this.createSurvey(pollingModes, type);
      resultPromises.push(surveyPromise);
    }
    return resultPromises;
  }
}

module.exports = SurveyFaker;
