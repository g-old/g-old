// @flow
import knex from '../knex';
import {
  canSee,
  canMutate,
  Models,
  PermissionError,
} from '../../core/accessControl';

type ID = number;
export const PhaseState: { [string]: string } = {
  todo: 'todo',
  active: 'active',
  done: 'done',
};

export type tPhaseState = $Keys<typeof PhaseState>;

type PhaseProps = {
  id?: ID,
  next_id?: ID,
  previous_id?: ID,
  proposal_id: ID,
  state: tPhaseState,
  created_at: string,
  updated_at?: string,
};

type PhaseInputProps = {
  id?: ID,
  nextID?: ID,
  previousId?: ID,
  proposalId?: ID,
  createdAt?: string,
  updatedAt?: ?string,
  state?: tPhaseState,
};

class Phase {
  id: ?ID;
  nextId: ?ID;
  previousId: ?ID;
  proposalId: ID;
  createdAt: string;
  updatedAt: ?string;
  state: tPhaseState;

  constructor(data: PhaseProps) {
    this.id = data.id;
    this.nextId = data.next_id;
    this.previousId = data.previous_id;
    this.proposalId = data.proposal_id;
    this.state = data.state;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  static async gen(viewer, id, { phases }) {
    const data = await phases.load(id);
    if (data === null) return null;
    return canSee(viewer, data, Models.PHASE) ? new Phase(data) : null;
  }

  static async create(viewer, data: PhaseInputProps, trx?: {}): Promise<Phase> {
    if (!canMutate(viewer, data, Models.PHASE)) {
      throw new PermissionError({ viewer, data, model: Models.PHASE });
    }

    const newData: PhaseProps = {
      created_at: new Date(),
      proposal_id: data.proposalId,
      ...(data.nextId && { next_id: data.nextId }),
      ...(data.previousId && { previous_id: data.previousId }),
      state: data.state || PhaseState.TODO,
    };

    const [phaseInDB]: PhaseProps = await knex('phases')
      .modify(queryBuilder => {
        if (trx) {
          queryBuilder.transacting(trx);
        }
      })
      .insert(newData)
      .returning('*');

    return new Phase(phaseInDB);
  }

  static async update(viewer, data) {
    if (!data || !data.id) return null;
    if (!canMutate(viewer, data, Models.PHASE)) return null;
    const newData = { updated_at: new Date() };
    const updatedPhase = await knex.transaction(async trx => {
      const [phase = null] = await knex('phases')
        .where({ id: data.id })
        .transacting(trx)
        .forUpdate()
        .update(newData)
        .returning('*');

      return phase;
    });

    return updatedPhase ? new Phase(updatedPhase) : null;
  }

  static async delete(viewer, data) {
    if (!data || !data.id) return null;
    if (!canMutate(viewer, data, Models.PHASE)) return null;
    const deletedPhase = await knex.transaction(async trx => {
      await knex('phases')
        .where({ id: data.id })
        .transacting(trx)
        .forUpdate()
        .del();
    });

    return deletedPhase ? new Phase(deletedPhase) : null;
  }
}

export default Phase;
