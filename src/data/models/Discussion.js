// @flow
import knex from '../knex';
import { canSee, canMutate, Models } from '../../core/accessControl';
import EventManager from '../../core/EventManager';
import WorkTeam from './WorkTeam'; // eslint-disable-line import/no-cycle
import Comment from './Comment';

type ID = number | string;
export type DiscussionProps = {
  id: ID,
  title: string,
  author_id: ID,
  work_team_id: ID,
  content: string,
  num_comments: number,
  created_at: string,
  updated_at: string,
  closed_at: string,
};

const checkIfCoordinator = async (viewer, data, workTeam) => {
  if (data.workTeamId) {
    let { coordinatorId } = workTeam;
    if (!coordinatorId) {
      ([coordinatorId = null] = await knex('work_teams'))
        .where({ id: data.workTeamId })
        .pluck('coordinator_id');
    }
    // eslint-disable-next-line
    return coordinatorId && coordinatorId == viewer.id;
  }
  return false;
};

class Discussion {
  id: ID;

  workTeamId: ID;

  constructor(data: DiscussionProps) {
    this.id = data.id;
    this.title = data.title;
    this.authorId = data.author_id;
    this.workTeamId = data.work_team_id;
    this.content = data.content;
    this.numComments = data.num_comments;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
    this.closedAt = data.closed_at;
  }

  static async gen(viewer, id, { discussions }) {
    if (!id) return null;
    const data = await discussions.load(id);

    if (data == null) return null;
    if (viewer.id == null) return null;
    if (!canSee(viewer, data, Models.DISCUSSION)) return null;
    return new Discussion(data);
  }

  static async create(viewer, data, loaders) {
    if (!data) return null;
    let workTeam = {};
    if (data.workTeamId) {
      workTeam = await WorkTeam.gen(viewer, data.workTeamId, loaders);
    }
    const isCoordinator = await checkIfCoordinator(viewer, data, workTeam);

    if (
      !canMutate(
        viewer,
        { ...data, isCoordinator, mainTeam: workTeam.mainTeam },
        Models.DISCUSSION,
      )
    )
      return null;

    const discussionInDB = await knex.transaction(async trx => {
      const [discussion = null] = await knex('discussions')
        .transacting(trx)
        .insert({
          author_id: viewer.id,
          title: data.title.trim(),
          content: data.content.trim(),
          work_team_id: data.workTeamId,
          created_at: new Date(),
        })
        .returning('*');

      if (discussion) {
        await knex('work_teams')
          .where({ id: data.workTeamId })
          .increment('num_discussions', 1);
      }
      return discussion;
    });
    const discussion = discussionInDB ? new Discussion(discussionInDB) : null;
    if (discussion) {
      EventManager.publish('onDiscussionCreated', {
        viewer,
        discussion,
        groupId: discussion.workTeamId,
        subjectId: discussion.workTeamId,
      });
    }
    return discussion;
  }

  static async update(viewer, data) {
    if (!data || !data.id) return null;
    const isCoordinator = await checkIfCoordinator(viewer, data);

    if (!canMutate(viewer, { ...data, isCoordinator }, Models.DISCUSSION)) {
      return null;
    }

    const newData = { updated_at: new Date() };
    if ('close' in data) {
      newData.closed_at = data.close === true ? new Date() : null;
    }

    const [discussion = null] = await knex('discussions')
      .where({ id: data.id })
      .update(newData)
      .returning('*');

    return discussion ? new Discussion(discussion) : null;
  }

  static async delete(viewer, data, loaders) {
    if (!data || !data.id) return null;
    const isCoordinator = await checkIfCoordinator(viewer, data);

    if (!canMutate(viewer, { ...data, isCoordinator }, Models.DISCUSSION)) {
      return null;
    }
    const deletedDiscussion = await knex.transaction(async () => {
      const discussion = await Discussion.gen(viewer, data.id, loaders);
      if (discussion) {
        const commentIds = await knex('comments')
          .where({ discussion_id: data.id })
          .pluck('id');
        // pass trx around?
        const commentDeletePromises = commentIds.map(cId =>
          Comment.delete(viewer, { id: cId }, loaders),
        );
        await Promise.all(commentDeletePromises);
        await knex('discussions')
          .where({ id: data.id })
          .del();

        await knex('work_teams')
          .where({ id: discussion.workTeamId })
          .decrement('num_discussions', 1);
      }
      return discussion;
    });

    return deletedDiscussion || null;
  }
}

export default Discussion;
