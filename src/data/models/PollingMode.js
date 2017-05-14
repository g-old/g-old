import knex from '../knex';

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
    const canSee = checkCanSee(viewer, data);
    return canSee ? new PollingMode(data) : null;
  }

  static async create(viewer, data, loaders) {
    console.log('CREATINGPOLLMODES', data);
    if (!checkCanMutate(viewer, data)) return null;
    if (!data.name) return null;
    if (!data.thresholdRef) return null;

    if (data.name.length < 0) return null;
    console.log('INSERTING PM');
    const id = await knex.transaction(async (trx) => {
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
