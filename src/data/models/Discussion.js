import knex from '../knex';
import { canSee, canMutate, Models } from '../../core/accessControl';

class Discussion {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.authorId = data.author_id;
    this.workTeamId = data.work_team_id;
    this.content = data.content;
    this.numComments = data.num_comments;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  static async gen(viewer, id, { discussions }) {
    if (!id) return null;
    const data = await discussions.load(id);

    if (data == null) return null;
    if (viewer.id == null) return null;
    if (!canSee(viewer, data, Models.DISCUSSION)) return null;

    return new Discussion(data);
  }

  static async create(viewer, data) {
    if (!data) return null;

    if (!canMutate(viewer, data, Models.DISCUSSION)) return null;
    const discussionInDB = await knex.transaction(async trx => {
      let discussion = await knex('discussions')
        .transacting(trx)
        .insert({
          author_id: viewer.id,
          title: data.title.trim(),
          content: data.content.trim(),
          work_team_id: data.workTeamId,
          created_at: new Date(),
        })
        .returning('*');

      discussion = discussion[0];
      if (discussion) {
        await knex('work_teams')
          .where({ id: data.workTeamId })
          .increment('num_discussions', 1);
      }
      return discussion;
    });

    return discussionInDB ? new Discussion(discussionInDB) : null;
  }
}

export default Discussion;
