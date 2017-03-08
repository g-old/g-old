import PollingMode from './PollingMode';
// eslint-disable-next-line no-unused-vars
function checkCanSee(viewer, data) { // TODO change data returned based on permissions
  return true;
}


class Poll {
  constructor(data) {
    this.id = data.id;
    this.pollingModeId = data.polling_mode_id;
    this.secret = data.secret;
    this.threshold = data.threshold;
    this.upvotes = data.upvotes;
    this.downvotes = data.downvotes;
    this.numVoter = data.num_voter;
    this.startTime = data.start_time;
    this.endTime = data.end_time;
  }
  static async gen(viewer, id, { polls }) {
    const data = await polls.load(id);
    if (data === null) return null;
    const canSee = checkCanSee(viewer, data);
    return canSee ? new Poll(data) : null;
  }
// eslint-disable-next-line class-methods-use-this
  isVotable() {
    return true;
  //  TODO return this.endTime >= new Date();
  }

  async isUnipolar(viewer, loaders) {
    const mode = await PollingMode.gen(viewer, this.pollingModeId, loaders);
    return mode.unipolar === true;
  }
  async isCommentable(viewer, loaders) {
    const mode = await PollingMode.gen(viewer, this.pollingModeId, loaders);
    return mode.with_statements === true;
  }

}

export default Poll;
