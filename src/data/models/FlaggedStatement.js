/* eslint-disable */
import knex from '../knex';

// eslint-disable-next-line no-unused-vars
function checkCanSee(viewer, data) {
  // TODO change data returned based on permissions
  // return viewer.role === data.type || ['admin', 'mods'].includes(viewer.role.type);
  return true;
}

class FlaggedStatement {
  constructor(data) {
    this.id = data.id;
    this.flaggerId = data.flagger_id;
    this.solver_id = data.solver_id;
    this.statement_id = data.statement_id;
    this.content = data.content;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }
  static async gen(viewer, id, { roles }) {
    const data = await knex('flagged_statements').select();
    if (data === null) return null;
    const canSee = checkCanSee(viewer, data);
    return canSee ? new Role(data) : null;
  }
}

export default Role;

/* eslint-enable */
