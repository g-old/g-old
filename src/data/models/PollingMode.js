import knex from '../knex';
import { canSee, canMutate, Models } from '../../core/accessControl';
import { transactify } from './utils';

// eslint-disable-next-line no-unused-vars
function checkCanSee(viewer, data) {
  // TODO change data returned based on permissions
  return true;
}
// eslint-disable-next-line no-unused-vars
function checkCanMutate(viewer, data) {
  // TODO change data returned based on permissions
  return true;
}

class PollingMode {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.thresholdRef = data.threshold_ref;
    this.unipolar = data.unipolar;
    this.withStatements = data.with_statements;
  }

  static async gen(viewer, id, { pollingModes }) {
    const data = await pollingModes.load(id);
    if (data === null) return null;
    return canSee(viewer, data, Models.POLLING_MODE)
      ? new PollingMode(data)
      : null;
  }

  static async createOrGet(viewer, data, loaders, trx) {
    if (!data) return null;
    if (!canMutate(viewer, data, Models.POLLING_MODE)) return null;

    const maybeCreate = async transaction => {
      let [pollingModeData = null] = await knex('polling_modes')
        .transacting(transaction)
        .where({
          unipolar: data.unipolar,
          with_statements: data.withStatements,
          threshold_ref: data.thresholdRef,
        })
        .orderBy('created_at', 'asc')
        .limit(1)
        .select();

      if (!pollingModeData) {
        [pollingModeData = null] = await knex('polling_modes')
          .transacting(transaction)
          .insert({
            name: data.name
              ? data.name
              : `${data.withStatements && 'with_statements'}_${
                  data.thresholdRef
                }_${data.unipolar && 'unipolar'}`,
            threshold_ref: data.thresholdRef,
            with_statements: data.withStatements,
            unipolar: data.unipolar,
          })
          .returning('*');
      }
      return pollingModeData;
    };
    const pollingMode = await transactify(maybeCreate, knex, trx);
    return pollingMode && new PollingMode(pollingMode);
  }

  static async create(viewer, data, loaders) {
    if (!checkCanMutate(viewer, data)) return null;
    if (!data.name) return null;
    if (!data.thresholdRef) return null;

    if (data.name.length < 0) return null;
    const id = await knex.transaction(async trx => {
      const pMId = await trx
        .insert({
          name: data.name,
          threshold_ref: data.thresholdRef,
          with_statements: data.withStatements,
          unipolar: data.unipolar,
        })
        .into('polling_modes')
        .returning('id');

      return pMId[0];
    });

    if (!id) return null;
    return PollingMode.gen(viewer, id, loaders);
  }
}

export default PollingMode;
