// @flow
import knex from '../knex';
import { canMutate, Models, PermissionError } from '../../core/accessControl';

// eslint-disable-next-line no-unused-vars
function checkCanSee(viewer, data) {
  // TODO change data returned based on permissions
  return true;
}

type ID = number | string;

export type Localization = {
  'de-DE'?: string,
  'it-IT'?: string,
  'lld-IT'?: string,
  default_name: string,
};

type ThresholdReference = 'all' | 'voters';
type PollingModeProps = {
  id: ID,
  names: Localization,
  owner_id: ID,
  inheritable: boolean,
  description: string,
  unipolar: boolean,
  with_statements: boolean,
  threshold_ref: ThresholdReference,
  created_at: string,
  deleted_at: string,
  updated_at: string,
};

type PollingModeInputs = {
  id?: ID,
  names?: Localization,
  ownerId?: ID,
  inheritable?: boolean,
  description?: string,
  unipolar?: boolean,
  withStatements?: boolean,
  thresholdRef?: ThresholdReference,
};

class PollingMode {
  id: ID;
  names: Localization;
  ownerId: ID;
  inheritable: boolean;
  description: string;
  unipolar: boolean;
  withStatements: boolean;
  thresholdRef: ThresholdReference;
  createdAt: string;
  deletedAt: string;
  updatedAt: string;

  constructor(data: PollingModeProps) {
    this.id = data.id;
    this.names = data.names;
    this.ownerId = data.owner_id;
    this.inheritable = data.inheritable;
    this.description = data.description;
    this.thresholdRef = data.threshold_ref;
    this.unipolar = data.unipolar;
    this.withStatements = data.with_statements;
    this.createdAt = data.created_at;
    this.deletedAt = data.deleted_at;
    this.updatedAt = data.updated_at;
  }
  static async gen(
    viewer,
    id: ID,
    { pollingModes }: {},
  ): Promise<?PollingMode> {
    const data = await pollingModes.load(id);
    return data ? new PollingMode(data) : null;
  }

  static async create(
    viewer,
    data: PollingModeInputs,
    trx?: {},
  ): Promise<PollingMode> {
    if (!canMutate(viewer, data, Models.POLLINGMODE)) {
      throw new PermissionError({ viewer, data, model: Models.POLLINGMODE });
    }
    const newValues = {
      names: data.names,
      threshold_ref: data.thresholdRef,
      with_statements: data.withStatements,
      unipolar: data.unipolar,
      owner_id: data.ownerId,
      inheritable: data.inheritable,
      description: data.description,
    };

    const [pollingMode] = await knex('polling_modes')
      .modify(queryBuilder => {
        if (trx) {
          queryBuilder.transacting(trx);
        }
      })
      .insert(newValues)
      .returning('*');

    return new PollingMode(pollingMode);
  }
}

export default PollingMode;
