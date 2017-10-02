/* eslint-disable */
import knex from "../knex";
import { canSee, Models } from "../../core/accessControl";
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
  static async gen(viewer, id) {
    const data = await knex("flagged_statements")
      .where({ id })
      .select();
    if (data === null) return null;
    return canSee(viewer, data, Models.FLAG)
      ? new FlaggedStatement(data)
      : null;
  }
}

export default FlaggedStatement;

/* eslint-enable */
