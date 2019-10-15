import knex from '../knex';
import { transactify } from './utils';
import { canSee, canMutate, Models } from '../../core/accessControl';
import { VerificationTypes } from './constants';
import ImageManager from '../../FileManager';

class Verification {
  constructor(props) {
    this.id = props.id;
    this.userId = props.user_id;
    this.verificatorId = props.verificator_id;
    this.filePath = props.file_path;
    this.idHash = props.id_hash;
    this.createdAt = props.created_at;
    this.updatedAt = props.updated_at;
  }

  static async gen(viewer, userId, { verificationsByUser }) {
    const data = await verificationsByUser.load(userId);
    if (data === null) return null;
    return canSee(viewer, data, Models.VERIFICATION)
      ? new Verification(data)
      : null;
  }

  static async create(viewer, data, loaders, trx) {
    if (!data) return null;
    if (!canMutate(viewer, data, Models.VERIFICATION)) return null;
    if (!data.filePath) {
      return null;
    }
    const newData = {
      created_at: new Date(),
      user_id: viewer.id,
    };

    if (data.filePath) {
      newData.file_path = data.filePath;
    }

    const createVerification = async transaction => {
      const [verification = null] = await knex('verifications')
        .transacting(transaction)
        .insert(newData)
        .returning('*');

      return verification;
    };

    const verificationInDB = await transactify(createVerification, knex, trx);

    return verificationInDB ? new Verification(verificationInDB) : null;
  }

  static async update(viewer, data, loaders, trx) {
    if (!data || !data.id) return null;
    if (!canMutate(viewer, data, Models.VERIFICATION)) return null;
    const newData = { updated_at: new Date(), verificator_id: viewer.id };
    if (
      data.status === VerificationTypes.CONFIRMED ||
      data.status === VerificationTypes.DENIED
    ) {
      const [filePath = null] = await knex('verifications')
        .where({ id: data.id })
        .limit(1)
        .pluck('file_path');
      if (filePath && filePath.length) {
        const res = await ImageManager.deletePrivateImage({
          viewer,
          data: { fileName: filePath.split('/').pop() },
        });
        if (!res.result) {
          return null;
        }
        newData.file_path = null;
      }
    }
    const updateVerification = async transaction => {
      const [verification = null] = await knex('verifications')
        .where({ id: data.id })
        .transacting(transaction)
        .forUpdate()
        .update(newData)
        .returning('*');

      return verification;
    };

    const updatedVerification = await transactify(
      updateVerification,
      knex,
      trx,
    );

    return updatedVerification ? new Verification(updatedVerification) : null;
  }
}

export default Verification;
