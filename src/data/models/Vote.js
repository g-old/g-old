
// eslint-disable-next-line no-unused-vars
function checkCanSee(viewer, data) { // TODO change data returned based on permissions
  return true;
}


class Vote {
  constructor(data) {
    this.id = data.id;
    this.userId = data.user_id;
    this.position = data.position;
    this.pollId = data.poll_id;
  }
  static async gen(viewer, id, { votes }) {
    const data = await votes.load(id);
    if (data === null) return null;
    const canSee = checkCanSee(viewer, data);
    return canSee ? new Vote(data) : null;
  }

}

export default Vote;
