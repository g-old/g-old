import knex from '../knex';
import { canSee, canMutate, Models } from '../../core/accessControl';

const MAX_CONTENT_LENGTH = 10000;
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
    this.editedAt = data.edited_at;
  }

  static async gen(viewer, id, { comments }) {
    if (!id) return null;
    const data = await comments.load(id);

    if (data == null) return null;
    if (viewer.id == null) return null;
    if (!canSee(viewer, data, Models.COMMENT)) return null;

    return new Comment(data);
  }

  static async create(viewer, data, loaders) {
    if (!data || !data.discussionId) return null;
    const discussion = await loaders.discussions.load(data.discussionId);
    if (
      !canMutate(
        viewer,
        { ...data, discussion, creating: true },
        Models.COMMENT,
      )
    ) {
      return null;
    }

    const commentInDB = await knex.transaction(async trx => {
      const content = data.content.substring(0, MAX_CONTENT_LENGTH);

      let comment = await knex('comments')
        .transacting(trx)
        .insert({
          author_id: viewer.id,
          content: content.trim(),
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

  static async update(viewer, data, { comments, discussions }) {
    if (!data || !data.id || !data.content) return null;
    const oldComment = await comments.load(data.id);
    const discussion = await discussions.load(oldComment.discussion_id);

    if (
      !canMutate(
        viewer,
        { ...data, authorId: oldComment.author_id, discussion },
        Models.COMMENT,
      )
    )
      return null;
    const commentInDB = await knex.transaction(async trx => {
      const content = data.content.substring(0, MAX_CONTENT_LENGTH);
      const now = new Date();
      let comment = await knex('comments')
        .where({ id: data.id })
        .transacting(trx)
        .forUpdate()
        .update({
          content: content.trim(),
          edited_at: now,
          updated_at: now,
        })
        .returning('*');
      comment = comment[0];
      if (comment) {
        comments.clear(data.id);
      }

      return comment;
    });
    return commentInDB ? new Comment(commentInDB) : null;
  }

  static async delete(viewer, data, { comments, discussions }) {
    if (!data || !data.id) return null;
    const oldComment = await comments.load(data.id);
    const discussion = await discussions.load(oldComment.discussion_id);

    if (
      !canMutate(
        viewer,
        { ...data, authorId: oldComment.author_id, discussion },
        Models.COMMENT,
      )
    ) {
      return null;
    }

    const commentInDB = await knex.transaction(async trx => {
      const statusOK = await knex('comments')
        .where({ id: data.id })
        .transacting(trx)
        .forUpdate()
        .del();

      if (oldComment.parentId) {
        await knex('comments')
          .where({ id: oldComment.parent_id })
          .transacting(trx)
          .forUpdate()
          .decrement('num_replies', 1);
      } else {
        await knex('discussions')
          .where({ id: oldComment.discussion_id })
          .transacting(trx)
          .forUpdate()
          .decrement('num_comments', oldComment.num_replies + 1); // TODO check if correct
      }

      if (statusOK) {
        comments.clear(data.id);
        return oldComment;
      }
      return statusOK;
    });
    return commentInDB ? new Comment(commentInDB) : null;
  }
}

export default Comment;
