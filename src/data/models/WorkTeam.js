import knex from '../knex';
import User from './User';
import { canSee, canMutate, Models } from '../../core/accessControl';
import { Groups } from '../../organization';

async function validateCoordinator(viewer, id, loaders) {
  const coordinator = await User.gen(viewer, id, loaders);
  return coordinator; // TODO val rules
}

class WorkTeam {
  constructor(data) {
    this.id = data.id;
    this.coordinatorId = data.coordinator_id;
    this.name = data.name;
    this.numMembers = data.num_members;
    this.numDiscussions = data.num_discussions;
    this.restricted = data.restricted;
    this.deName = data.de_name;
    this.itName = data.it_name;
    this.lldName = data.lld_name;
    this.mainTeam = data.main;
  }
  canNotify(viewer) {
    // eslint-disable-next-line eqeqeq
    return viewer.id == this.coordinatorId || viewer.role.type === 'admin';
  }
  canJoin(viewer, requester) {
    // eslint-disable-next-line eqeqeq
    if (this.restricted && viewer.id == this.coordinatorId) {
      if (requester.groups !== Groups.GUEST) {
        return true; // TODO specify rules;
      }
      return true;
    }
    // eslint-disable-next-line eqeqeq

    if (requester.groups !== Groups.GUEST) {
      return true; // TODO specify rules;
    }

    return false;
  }
  async modifySessions(userId) {
    const oldSessions = await knex('sessions')
      .whereRaw("sess->'passport'->'user'->>'id'=?", [userId])
      .select('sess', 'sid');
    const updates = oldSessions.map(data => {
      const session = data.sess;
      const wtMemberships = [...session.passport.user.wtMemberships, this.id];
      const newSession = {
        ...session,
        passport: {
          ...session.passport,
          user: {
            ...session.passport.user,
            wtMemberships,
          },
        },
      };
      return knex('sessions')
        .where({ sid: data.sid })
        .update({ sess: JSON.stringify(newSession) });
    });
    // TODO UPDATE TO POSTGRES 9.6!!
    await Promise.all(updates);
    /* await knex.raw(
      "update sessions set sess = jsonb_set(sess::jsonb, '{passport}',?) where sess->'passport'->'user'->>'id'=?",
      [serializedUser, this.id],
    ); */
  }
  async join(viewer, memberId, loaders) {
    let requester;
    // eslint-disable-next-line eqeqeq
    if (viewer && viewer.id != memberId) {
      requester = await User.gen(viewer, memberId, loaders);
    } else {
      requester = viewer;
    }
    if (!this.canJoin(viewer, requester)) return null;
    const wtId = await knex.transaction(async trx => {
      let id = await trx
        .insert({
          user_id: requester.id,
          work_team_id: this.id,
          ...(this.restricted && { authorizer_id: viewer.id }),
          created_at: new Date(),
        })
        .into('user_work_teams')
        .returning('id');

      id = id[0];
      if (id) {
        await knex('work_teams')
          .transacting(trx)
          .forUpdate()
          .increment('num_members', 1)
          .into('work_teams');

        // insert into sessions;
        await this.modifySessions(requester.id);
        // TODO  should be sent via sse too in case viewer != requester.
      }
      return id;
    });
    return wtId ? requester : null;
  }

  async leave(viewer, memberId, loaders) {
    // viewer is already checked
    if (!this.canJoin(viewer, memberId)) return null;
    const wtId = await knex.transaction(async trx => {
      let id = await trx
        .where({ user_id: memberId, work_team_id: this.id })
        .into('user_work_teams')
        .del()
        .returning('id');

      id = id[0];
      if (id) {
        await knex('work_teams')
          .transacting(trx)
          .forUpdate()
          .decrement('num_members', 1)
          .into('work_teams');
      }
      return id;
    });
    return wtId ? User.gen(viewer, memberId, loaders) : null;
  }

  async circularFeedNotification(viewer, activity, pushFn) {
    if (!this.canNotify(viewer)) return null;

    const teamIds = await knex('user_work_teams')
      .where({ work_team_id: this.id })
      .pluck('user_id');
    const promises = teamIds.map(id => pushFn(id, activity.id));

    return Promise.all(promises);
  }

  static async gen(viewer, id, { workTeams }) {
    if (!id) return null;
    const data = await workTeams.load(id);
    if (!data) return null;
    if (!canSee(viewer, data, Models.WORKTEAM)) return null;
    return new WorkTeam(data);
  }

  static async create(viewer, data, loaders) {
    if (!canMutate(viewer, data, Models.WORKTEAM)) return null;
    if (!data) return null;
    if (!data.name) return null;
    const newData = {};
    newData.name = data.name;
    if (data.coordinatorId) {
      if (!validateCoordinator(viewer, data.coordinatorId, loaders))
        return null;
      newData.coordinator_id = data.coordinatorId;
    }
    newData.created_at = new Date();
    let wtId = await knex.transaction(async trx =>
      trx
        .insert(newData)
        .into('work_teams')
        .returning('id'),
    );
    wtId = wtId[0];
    return wtId ? WorkTeam.gen(viewer, wtId, loaders) : null;
  }

  static async update(viewer, data, loaders) {
    if (!canMutate(viewer, data, Models.WORKTEAM)) return null;
    if (!data) return null;
    if (!data.id) return null;
    const newData = {};
    if (data.name) {
      newData.name = data.name;
    }
    if (data.coordinatorId) {
      if (!validateCoordinator(viewer, data.coordinatorId, loaders))
        return null;
      newData.coordinator_id = data.coordinatorId;
    }
    newData.updated_at = new Date();
    let wtId = await knex.transaction(async trx =>
      // eslint-disable-next-line newline-per-chained-call
      knex('work_teams')
        .transacting(trx)
        .forUpdate()
        .update(newData)
        .returning('id'),
    );
    wtId = wtId[0];
    return wtId ? WorkTeam.gen(viewer, wtId, loaders) : null;
  }
}

export default WorkTeam;
