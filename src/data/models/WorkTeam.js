import knex from '../knex';
import User from './User';
import Request from './Request';
import Proposal from './Proposal';

import { canSee, canMutate, Models } from '../../core/accessControl';
import { Groups } from '../../organization';

async function validateCoordinator(viewer, id, loaders) {
  const coordinator = await User.gen(viewer, id, loaders);
  return coordinator; // TODO val rules
}

async function updateCoordinatorsGroups(viewer, id, loaders) {
  const coordinator = await User.gen(viewer, id, loaders);
  if (coordinator) {
    // eslint-disable-next-line no-bitwise
    const newGroups = coordinator.groups | Groups.TEAM_LEADER;
    await User.update(viewer, { id, groups: newGroups }, loaders);
    loaders.users.clear(id);
  }
}

class WorkTeam {
  constructor(data) {
    this.id = data.id;
    this.coordinatorId = data.coordinator_id;
    this.name = data.name;
    this.numMembers = data.num_members;
    this.numDiscussions = data.num_discussions;
    this.numProposals = data.num_proposals;
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
    if (!this.canModifyMemberShips(viewer, requester)) {
      // Guests not allowed
      if (requester.groups === Groups.GUEST) {
        return null; // TODO specify rules;
      }
      // eslint-disable-next-line eqeqeq
      if (this.restricted && requester.id != this.coordinatorId) {
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
        return WorkTeam.gen(viewer, this.id, loaders);
      }
    }

    const workTeam = await knex.transaction(async trx => {
      // check for request
      // eslint-disable-next-line eqeqeq
      if (this.restricted && requester.id != this.coordinatorId) {
        const [requestId = null] = await knex('requests')
          .transacting(trx)
          .forUpdate()
          .where({ type: 'joinWT', requester_id: requester.id })
          .whereRaw("content->>'id' = ?", [this.id])
          .del()
          .returning('id');

        if (!requestId) {
          throw new Error('No request found');
        }
      }
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
          // update viewer
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
      // If member,
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
        { type: 'joinWT', contentId: this.id },
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

  static async checkForMainTeam(newTeamStatus, transaction) {
    if (newTeamStatus) {
      const res = await knex('work_teams')
        .transacting(transaction)
        .where({ main: true })
        .pluck('id');
      if (res && res.length) {
        throw new Error('Main team already set');
      }
    }
    return true;
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
    if (typeof data.mainTeam === 'boolean') {
      newData.main = data.mainTeam;
    }
    if (data.coordinatorId) {
      if (!validateCoordinator(viewer, data.coordinatorId, loaders))
        return null;
      newData.coordinator_id = data.coordinatorId;
    }
    newData.created_at = new Date();
    const workTeam = await knex.transaction(async trx => {
      await WorkTeam.checkForMainTeam(newData.main, trx);
      const [workTeamData = null] = await trx
        .insert(newData)
        .into('work_teams')
        .returning('*');

      if (!workTeamData) {
        throw new Error('Could not create workTeam');
      }
      // make feed;
      await knex('system_feeds')
        .transacting(trx)
        .insert({
          group_id: workTeamData.id,
          type: 'WT',
          main_activities: JSON.stringify([]),
        });
      return workTeamData;
    });
    if (workTeam) {
      await updateCoordinatorsGroups(viewer, data.coordinatorId, loaders);
    }
    return workTeam ? new WorkTeam(workTeam) : null;
  }

  static async update(viewer, data, loaders) {
    if (!data || !data.id) return null;
    if (!canMutate(viewer, data, Models.WORKTEAM)) return null;
    const newData = {};

    if ('name' in data) {
      newData.name = data.name;
    }
    if ('deName' in data) {
      newData.de_name = data.deName;
    }
    if ('itName' in data) {
      newData.it_name = data.itName;
    }
    if ('lldName' in data) {
      newData.lld_name = data.lldName;
    }
    if ('restricted' in data) {
      newData.restricted = data.restricted;
    }
    if (data.logo || data.logoAssetId) {
      throw new Error('Not implemented yet: LOGO');
    }
    if (data.background || data.backgroundAssetId) {
      throw new Error('Not implemented yet: BACKGROUND');
    }
    if (typeof data.mainTeam === 'boolean') {
      newData.main = data.mainTeam;
    }

    if (data.coordinatorId) {
      if (!validateCoordinator(viewer, data.coordinatorId, loaders))
        return null;
      newData.coordinator_id = data.coordinatorId;
    }

    if (Object.keys(newData).length) {
      newData.updated_at = new Date();
    }
    const [workTeam = null] = await knex.transaction(async trx => {
      await WorkTeam.checkForMainTeam(newData.main, trx);
      // eslint-disable-next-line newline-per-chained-call
      return knex('work_teams')
        .where({ id: data.id })
        .transacting(trx)
        .forUpdate()
        .update(newData)
        .returning('*');
    });

    if (workTeam && newData.coordinator_id) {
      // assign right to new coordinator
      await updateCoordinatorsGroups(viewer, data.coordinatorId, loaders);
      // check if old coordinator is still coordinator of a workteam
    }

    return workTeam ? new WorkTeam(workTeam) : null;
  }

  async getLinkedProposals(viewer, loaders) {
    if (!this.mainTeam || !this.args) return [];
    const proposalIds = await knex('proposal_groups')
      .where({
        state: this.args.proposalState,
        group_id: this.id,
        group_type: 'WT',
      })
      .pluck('proposal_id');
    return proposalIds.map(pId => Proposal.gen(viewer, pId, loaders));
  }
}

export default WorkTeam;
