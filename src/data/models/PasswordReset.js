import crypto from 'crypto';
import knex from '../knex';
import { validateEmail } from '../../core/helpers';

const hoursValid = 1;
const genToken = () =>
  new Promise((resolve, reject) => {
    // eslint-disable-next-line no-confusing-arrow
    crypto.randomBytes(20, (err, buffer) => err ? reject(err) : resolve(buffer.toString('hex')));
  });

class PasswordReset {
  constructor(data) {
    this.resetToken = data.reset_password_token;
    this.expires = data.reset_password_expires;
    this.userId = data.user_id;
  }

  static async checkToken({ token }) {
    if (!token || typeof token !== 'string') return null;
    const resetData = await knex.transaction(async trx => {
      let data = await trx.where({ reset_password_token: token }).into('password_resets').select();
      data = data[0];
      if (data) {
        // eslint-disable-next-line newline-per-chained-call
        await knex('password_resets').transacting(trx).forUpdate().where({ id: data.id }).del('id');
      }
      return data;
    });
    if (!resetData || resetData.reset_password_expires < new Date()) return null;
    return new PasswordReset(resetData);
  }

  static async createToken({ email }) {
    if (!email || typeof email !== 'string') return null;
    if (!validateEmail(email)) return null;

    const resetToken = await knex.transaction(async trx => {
      let userId = await trx.where({ email }).into('users').pluck('id');
      userId = userId[0];
      if (!userId) throw Error('User not found');
      const token = await genToken();
      if (!token) throw Error('Token generation failed');
      const expiration = new Date();
      expiration.setHours(expiration.getHours() + hoursValid);
      // If user exists in table, update
      const exists = await knex('password_resets')
        .transacting(trx)
        .forUpdate()
        .where({ user_id: userId })
        .pluck('id');

      if (exists[0]) {
        await knex('password_resets')
          .transacting(trx)
          .forUpdate()
          .where({ user_id: userId })
          .update({
            reset_password_token: token,
            reset_password_expires: expiration,
            updated_at: new Date(),
          });
      } else {
        await knex('password_resets').transacting(trx).forUpdate().insert({
          reset_password_token: token,
          reset_password_expires: expiration,
          user_id: userId,
          created_at: new Date(),
        });
      }

      return token || null;
    });
    return resetToken;
  }
}

export default PasswordReset;
