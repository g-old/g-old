// @flow
import knex from '../knex';
import { canSee, canMutate, Models } from '../../core/accessControl';
import EventManager from '../../core/EventManager';
import { isAdmin, Groups } from '../../organization';
import { transactify } from './utils';
import log from '../../logger';

type ID = string | number;
export type CommentProps = {
  id: ID,
  author_id: ID,
  discussion_id: ID,
  content: string,
  parent_id: ID,
  num_replies: number,
  created_at: string,
  updated_at: string,
  edited_at: string,
  deleted_at: string,
  num_votes: number,
};

const MAX_CONTENT_LENGTH = 10000;
class Comment {
  id: ID;

  authorId: ID;

  discussionId: ID;

  content: string;

  parentId: ID;

  numReplies: number;

  createdAt: string;

  updatedAt: string;

  editedAt: string;

  deletedAt: string;

  constructor(data: CommentProps) {
    this.id = data.id;
    this.authorId = data.author_id;
    this.discussionId = data.discussion_id;
    this.content = data.content;
    this.parentId = data.parent_id;
    this.numReplies = data.num_replies;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
    this.editedAt = data.edited_at;
    this.deletedAt = data.deleted_at;
    this.numVotes = data.num_votes;
  }

  static async gen(viewer, id, { comments, discussions }) {
    if (!id) return null;
    const data = await comments.load(id);
    if (data == null) return null;
    if (viewer.id == null) return null;
    const discussion = await discussions.load(data.discussion_id);
    if (
      !canSee(
        viewer,
        { ...data, discussion: { workteamId: discussion.work_team_id } },
        Models.COMMENT,
      )
    )
      return null;

    return new Comment(data);
  }

  static async create(viewer, data, loaders) {
    if (!data || !data.discussionId) return null;
    const discussion = await loaders.discussions.load(data.discussionId);
    if (!discussion) {
      return null;
    }
    if (
      !canMutate(
        viewer,
        {
          ...data,
          discussion: {
            workteamId: discussion.work_team_id,
            closedAt: discussion.closed_at,
          },
          creating: true,
        },
        Models.COMMENT,
      )
    ) {
      return null;
    }

    let workteamId;
    const commentInDB = await knex.transaction(async trx => {
      const content = data.content.substring(0, MAX_CONTENT_LENGTH);

      const [comment = null] = await knex('comments')
        .transacting(trx)
        .insert({
          author_id: viewer.id,
          content: content.trim(),
          discussion_id: data.discussionId,
          parent_id: data.parentId,
          created_at: new Date(),
        })
        .returning('*');

      if (comment) {
        [workteamId] = await knex('discussions')
          .where({ id: data.discussionId })
          .transacting(trx)
          .forUpdate()
          .increment('num_comments', 1)
          .returning('work_team_id');

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

    const comment = commentInDB ? new Comment(commentInDB) : null;
    if (comment && workteamId) {
      EventManager.publish('onCommentCreated', {
        viewer,
        comment,
        subjectId: data.discussionId,
        groupId: workteamId,
        info: { workteamId },
      });
    }

    return comment;
  }

  static async update(viewer, data, { comments, discussions }) {
    if (!data || !data.id || !data.content) return null;
    const oldComment = await comments.load(data.id);
    const discussion = await discussions.load(oldComment.discussion_id);

    if (
      !canMutate(
        viewer,
        {
          ...data,
          authorId: oldComment.author_id,
          discussion: { closedAt: discussion.closed_at },
        },
        Models.COMMENT,
      )
    )
      return null;
    const commentInDB = await knex.transaction(async trx => {
      const content = data.content.substring(0, MAX_CONTENT_LENGTH);
      const now = new Date();
      const [comment = null] = await knex('comments')
        .where({ id: data.id })
        .transacting(trx)
        .forUpdate()
        .update({
          content: content.trim(),
          edited_at: now,
          updated_at: now,
        })
        .returning('*');
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
        {
          ...data,
          delete: true,
          authorId: oldComment.author_id,
          discussion: { closedAt: discussion.closed_at },
        },
        Models.COMMENT,
      )
    ) {
      return null;
    }

    let workteamId;
    let replyIds;
    const commentInDB = await knex.transaction(async trx => {
      // search for replies - pass ids as eventprops;

      const statusOK = await knex('comments')
        .where({ id: data.id })
        .transacting(trx)
        .forUpdate()
        .del();

      if (oldComment.parent_id) {
        await knex('comments')
          .where({ id: oldComment.parent_id })
          .transacting(trx)
          .forUpdate()
          .decrement('num_replies', 1);
        [workteamId = null] = await knex('discussions')
          .where({ id: oldComment.discussion_id })
          .transacting(trx)
          .forUpdate()
          .decrement('num_comments', 1)
          .returning('work_team_id'); // TODO check if correct
      } else {
        // probably has replies
        replyIds = await knex('comments')
          .where({ parent_id: oldComment.id })
          .pluck('id');

        [workteamId = null] = await knex('discussions')
          .where({ id: oldComment.discussion_id })
          .transacting(trx)
          .forUpdate()
          .decrement('num_comments', oldComment.num_replies + 1)
          .returning('work_team_id'); // TODO check if correct
      }

      if (statusOK) {
        comments.clear(data.id);
        return oldComment;
      }
      return statusOK;
    });
    const comment = commentInDB ? new Comment(commentInDB) : null;
    if (comment && workteamId) {
      EventManager.publish('onCommentDeleted', {
        viewer,
        comment: { ...comment, replyIds },
        subjectId: data.discussionId,
        groupId: workteamId,
        info: { workteamId, replyIds },
      });
    }
    return comment;
  }

  static async flag(viewer, data, loaders, trx) {
    if (!viewer.id || !data.id) {
      return null;
    }
    const time = new Date();
    const createFlag = async transaction => {
      // check if comment still exists;
      try {
        const [commentData = null] = await knex('comments')
          .transacting(transaction)
          .where({ id: data.id })
          .select('*');
        if (!commentData) {
          throw new Error('comment-not-existing');
        }
        if (commentData.deleted_at) {
          throw new Error('comment-already-deleted');
        }

        const [flaggedCommentData = null] = await knex('flagged_comments')
          .transacting(transaction)
          .where({ comment_id: data.id })
          .select('*');
        let discussionData;

        // permission check
        let canDelete =
          isAdmin(viewer) ||
          (viewer.permissions & Permissions.DELETE_COMMENTS) > 0;
        if (!canDelete && (viewer.groups & Groups.TEAM_LEADER) > 0) {
          // check if is coordinator
          [discussionData = null] = await knex('discussions')
            .where({
              id: commentData.discussion_id,
            })
            .select('*');
          const [workteamData = null] = await knex('workteams')
            .where({ id: discussionData.work_team_id })
            .select('*');
          if (workteamData && workteamData.coordinator_id == viewer.id) {
            canDelete = true;
          }
        }

        if (!flaggedCommentData) {
          // create
          if (!discussionData) {
            [discussionData = null] = await knex('discussions')
              .where({
                id: commentData.discussion_id,
              })
              .select('*');
            if (!discussionData) {
              throw new Error('discussion-not-existing');
            }
          }
          const newData = {
            flagger_id: viewer.id,
            comment_id: data.id,
            content: commentData.content,
            state: 'open',
            workteam_id: discussionData.work_team_id,
            created_at: time,
          };

          if (canDelete) {
            newData.solver_id = viewer.id;
            newData.state = 'deleted';
          }
          await knex('flagged_comments')
            .transacting(transaction)
            .insert(newData);
        } else {
          // update the record
          const updatedData = {
            updated_at: time,
          };

          if (canDelete) {
            updatedData.state = 'deleted';
            updatedData.solver_id = viewer.id;
          }
          await knex('flagged_comments')
            .transacting(transaction)
            .forUpdate()
            .modify(queryBuilder => {
              if (!canDelete) {
                queryBuilder.increment('num_flags', 1);
              }
            })
            .update({
              updated_at: new Date(),
              solver_id: viewer.id,
              state: 'deleted',
            });
        }
        // update comment with new text
        if (canDelete) {
          const newText = `Deleted by moderation at ${time.toDateString()}`;

          const [comment = null] = await knex('comments')
            .transacting(transaction)
            .forUpdate()
            .where({ id: data.id })
            .update({ content: newText, deleted_at: time, updated_at: time })
            .returning('*');
          return comment;
        }
        return commentData;
      } catch (err) {
        log.error(err);
        return null;
      }
    };
    const commentInDB = await transactify(createFlag, knex, trx);
    return commentInDB ? new Comment(commentInDB) : null;
  }
}

export default Comment;
