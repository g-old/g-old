import knex from '../knex';
import User from './User';
import Request from './Request';
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
  canModifyMemberShips(viewer, requester) {
    // eslint-disable-next-line eqeqeq
    if (this.restricted) {
      /* eslint-disable eqeqeq */
      if (
        requester.id == this.coordinatorId ||
        viewer.id == this.coordinatorId
      ) {
        return true;
      }
      return false;
    }
    /* eslint-enable eqeqeq */

    if (requester.groups !== Groups.GUEST) {
      return true; // TODO specify rules;
    }

    return false;
  }
  async addMembershipToSessions(userId) {
    return this.modifySessions(userId, true);
  }

  async removeMembershipFromSessions(userId) {
    return this.modifySessions(userId, false);
  }

  async modifySessions(userId, add) {
    const oldSessions = await knex('sessions')
      .whereRaw("sess->'passport'->'user'->>'id'=?", [userId])
      .select('sess', 'sid');
    const updates = oldSessions.map(data => {
      const session = data.sess;
      const wtMemberships = add
        ? [...session.passport.user.wtMemberships, this.id]
        : session.passport.user.wtMemberships.filter(id => id != this.id); // eslint-disable-line
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
        .forUpdate()
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
    if (memberId) {
      requester = await User.gen(viewer, memberId, loaders);
    } else {
      requester = viewer;
    }
    // eslint-disable-next-line eqeqeq
    if (this.restricted && requester.id != this.coordinatorId) {
      if (!this.canModifyMemberShips(viewer, requester)) {
        // make request
        const request = await Request.create(
          viewer,
          {
            content: JSON.stringify({ id: this.id }),
            type: 'joinWT',
          },
          loaders,
        );
        if (!request) {
          throw new Error('Could not create request');
        }
      }
      return WorkTeam.gen(viewer, this.id, loaders);
    }
    const workTeam = await knex.transaction(async trx => {
      const [id = null] = await trx
        .insert({
          user_id: requester.id,
          work_team_id: this.id,
          ...(this.restricted && { authorizer_id: viewer.id }),
          created_at: new Date(),
        })
        .forUpdate()
        .into('user_work_teams')
        .returning('id');

      if (id) {
        const [workTeaminDB = null] = await knex('work_teams')
          .where({ id: this.id })
          .transacting(trx)
          .forUpdate()
          .increment('num_members', 1)
          .into('work_teams')
          .returning('*');
        loaders.workTeams.clear(this.id);
        // insert into sessions;
        if (workTeaminDB) {
          await this.addMembershipToSessions(requester.id);
          // eslint-disable-next-line no-param-reassign
          viewer.wtMemberships = viewer.wtMemberships
            ? [...viewer.wtMemberships, this.id]
            : [this.id];
        }
        // TODO  should be sent via sse too in case viewer != requester.
        return workTeaminDB;
      }
      return id;
    });
    return workTeam ? new WorkTeam(workTeam) : null;
  }

  async leave(viewer, memberId, loaders) {
    // viewer is already checked

    let requester;
    if (memberId) {
      requester = await User.gen(viewer, memberId, loaders);
    } else {
      requester = viewer;
    }
    /* eslint-disable eqeqeq */
    if (requester.id != viewer.id) {
      if (viewer.id != this.coordinatorId) {
        return null;
      }
    }
    /* eslint-enable eqeqeq */

    const workTeam = await knex.transaction(async trx => {
      const [id = null] = await trx
        .where({ user_id: requester.id, work_team_id: this.id })
        .forUpdate()
        .into('user_work_teams')
        .del()
        .returning('id');
      if (id) {
        const [workTeaminDB = null] = await knex('work_teams')
          .where({ id: this.id })
          .transacting(trx)
          .forUpdate()
          .decrement('num_members', 1)
          .into('work_teams')
          .returning('*');

        loaders.workTeams.clear(this.id);

        if (workTeaminDB) {
          await this.removeMembershipFromSessions(requester.id);
          // eslint-disable-next-line no-param-reassign
          viewer.wtMemberships =
            viewer.wtMemberships &&
            viewer.wtMemberships.filter(id => id != this.id); // eslint-disable-line
        }
        return workTeaminDB ? new WorkTeam(workTeaminDB) : null;
      }

      // delete request ;

      const deletedRequest = await Request.delete(
        viewer,
        { type: 'joinWT' },
        loaders,
      );
      if (!deletedRequest) {
        throw new Error('Could not delete request');
      }
      loaders.workTeams.clear(this.id);

      return WorkTeam.gen(viewer, this.id, loaders);
    });
    return workTeam;
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
    const newData = {
      ...(data.name && { name: data.name }),
      ...(data.deName && { de_name: data.deName }),
      ...(data.itName && { it_name: data.itName }),
      ...(data.lldName && { lld_name: data.lldName }),
      ...(data.restricted && { restricted: data.restricted }),
    };
    if (!data.restricted) {
      newData.restricted = false;
    }
    if (typeof data.main === 'boolean') {
      throw new Error('Not implemented yet: MAIN');
    }
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
    if (!data || !data.id) return null;
    if (!canMutate(viewer, data, Models.WORKTEAM)) return null;
    const newData = {
      ...(data.name && { name: data.name }),
      ...(data.deName && { de_name: data.deName }),
      ...(data.itName && { it_name: data.itName }),
      ...(data.lldName && { lld_name: data.lldName }),
      ...(data.restricted && { restricted: data.restricted }),
    };
    if (data.logo || data.logoAssetId) {
      throw new Error('Not implemented yet: LOGO');
    }
    if (data.background || data.backgroundAssetId) {
      throw new Error('Not implemented yet: BACKGROUND');
    }
    if (typeof data.main === 'boolean') {
      throw new Error('Not implemented yet: MAIN');
    }

    if (data.coordinatorId) {
      if (!validateCoordinator(viewer, data.coordinatorId, loaders))
        return null;
      newData.coordinator_id = data.coordinatorId;
    }

    if (Object.keys(newData).length) {
      newData.updated_at = new Date();
    }
    const [workTeam = null] = await knex.transaction(async trx =>
      // eslint-disable-next-line newline-per-chained-call
      knex('work_teams')
        .where({ id: data.id })
        .transacting(trx)
        .forUpdate()
        .update(newData)
        .returning('*'),
    );
    return workTeam ? new WorkTeam(workTeam) : null;
  }
}

export default WorkTeam;
