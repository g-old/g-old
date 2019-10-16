import knex from '../knex';
import { canSee, canMutate, Models } from '../../core/accessControl';
import { transactify } from './utils';
import Comment from './Comment';

class CommentVote {
  constructor(data) {
    this.id = data.id;
    this.position = data.position;
    this.userId = data.user_id;
    this.commentId = data.commentId;
  }

  static async gen(viewer, id, { commentVotes }) {
    const data = await commentVotes.load(id);
    if (data === null) return null;
    return canSee(viewer, data, Models.COMMENT_VOTE)
      ? new CommentVote(data)
      : null;
  }

  static async create(viewer, data, loaders, trx) {
    if (!data || !data.position || !data.commentId) return null;
    if (!canMutate(viewer, data, Models.COMMENT_VOTE)) return null;

    const newData = {
      comment_id: data.commentId,
      position: data.position === 'pro' ? 'pro' : 'con',
      user_id: viewer.id,
      created_at: new Date(),
    };

    const createCommentVote = async transaction => {
      const [commentVote = null] = await knex('comment_votes')
        .transacting(transaction)
        .insert(newData)
        .returning('*');
      let comment;
      if (commentVote) {
        [comment = null] = await knex('comments')
          .transacting(transaction)
          .where({ id: data.commentId })
          .forUpdate()
          .modify(queryBuilder =>
            commentVote.position === 'pro'
              ? queryBuilder.increment('num_votes', 1)
              : queryBuilder.decrement('num_votes', 1),
          )
          .returning('*');
      }
      return comment;
    };

    const commentVoteInDB = await transactify(createCommentVote, knex, trx);

    return commentVoteInDB ? new Comment(commentVoteInDB) : null;
  }

  static async update(viewer, data, loaders, trx) {
    if (!data || !data.id || !data.position) return null;
    if (!canMutate(viewer, data, Models.COMMENT_VOTE)) return null;
    const newData = {
      updated_at: new Date(),
      position: data.position === 'pro' ? 'pro' : 'con',
    };

    const updateCommentVote = async transaction => {
      const [commentVote = null] = await knex('comment_votes')
        .where({ id: data.id })
        .transacting(transaction)
        .forUpdate()
        .update(newData)
        .returning('*');
      let comment;
      if (commentVote) {
        [comment] = await knex('comments')
          .transacting(transaction)
          .where({ id: commentVote.comment_id })
          .forUpdate()
          .modify(queryBuilder =>
            commentVote.position === 'pro'
              ? queryBuilder.increment('num_votes', 2)
              : queryBuilder.decrement('num_votes', 2),
          )
          .returning('*');
      }

      return comment;
    };

    const updatedCommentVote = await transactify(updateCommentVote, knex, trx);

    return updatedCommentVote ? new Comment(updatedCommentVote) : null;
  }

  static async delete(viewer, data, loaders, trx) {
    if (!data || !data.id || !data.position || !data.commentId) return null;
    if (!canMutate(viewer, data, Models.COMMENT_VOTE)) return null;

    const deleteCommentVote = async transaction => {
      const result = await knex('comment_votes')
        .where({
          id: data.id,
          comment_id: data.commentId,
          position: data.position === 'pro' ? 'pro' : 'con', // to check correctnes of pos
        })
        .transacting(transaction)
        .forUpdate()
        .del();

      let comment;
      if (result) {
        [comment] = await knex('comments')
          .transacting(transaction)
          .where({ id: data.commentId })
          .forUpdate()
          .modify(queryBuilder =>
            data.position === 'pro'
              ? queryBuilder.decrement('num_votes', 1)
              : queryBuilder.increment('num_votes', 1),
          )
          .returning('*');
      }

      return comment;
    };

    const deletedCommentVote = await transactify(deleteCommentVote, knex, trx);

    return deletedCommentVote ? new Comment(deletedCommentVote) : null;
  }
}

export default CommentVote;
