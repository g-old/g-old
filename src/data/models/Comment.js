import knex from '../knex';
import { canSee, canMutate, Models } from '../../core/accessControl';

class Comment {
  constructor(data) {
    this.id = data.id;
    this.authorId = data.author_id;
    this.discussionId = data.discussion_id;
    this.content = data.content;
    this.parentId = data.parent_id;
    this.numReplies = data.num_replies;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  static async gen(viewer, id, { comments }) {
    if (!id) return null;
    const data = await comments.load(id);

    if (data == null) return null;
    if (viewer.id == null) return null;
    if (!canSee(viewer, data, Models.COMMENT)) return null;

    return new Comment(data);
  }

  static async create(viewer, data) {
    if (!data) return null;
    if (!canMutate(viewer, data, Models.COMMENT)) return null;

    const commentInDB = await knex.transaction(async trx => {
      let comment = await knex('comments')
        .transacting(trx)
        .insert({
          author_id: viewer.id,
          content: data.content.trim(),
          discussion_id: data.discussionId,
          parent_id: data.parentId,
          created_at: new Date(),
        })
        .returning('*');

      comment = comment[0];
      if (comment) {
        await knex('discussions')
          .transacting(trx)
          .forUpdate()
          .increment('num_comments', 1);

        if (comment.parent_id) {
          await knex('comments')
            .where({ id: comment.parent_id })
            .transacting(trx)
            .forUpdate()
            .increment('num_replies', 1);
        }
      }
      return comment;
    });

    return commentInDB ? new Comment(commentInDB) : null;
  }
}

export default Comment;
