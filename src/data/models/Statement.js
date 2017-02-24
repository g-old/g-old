
/* eslint-disable no-unused-vars */
function checkCanSee(viewer, data) { // TODO change data returned based on permissions
  return true;
}

function validateVoter(viewer, data) {
}
function validateTitle(viewer, data) {
}
function validateBody(viewer, data) {
}

class Statement {
  constructor(data) {
    this.id = data.id;
    this.author_id = data.author_id;
    this.title = data.title;
    this.text = data.body;
    this.position = data.position;
    this.likes = data.likes;
    this.vote_id = data.vote_id;
    this.poll_id = data.poll_id;
  }

  static async gen(viewer, id, { statements }) {
    const data = await statements.load(id);
    if (data === null) return null;
    const canSee = checkCanSee(viewer, data);
    return canSee ? new Statement(data) : null;
  }

  static async create(viewer, data) {
    // validate

    // knex
    const res = { id: 1, title: data.title, body: data.text, positon: data.position };
    return new Statement(res);
  }
}

export default Statement;
