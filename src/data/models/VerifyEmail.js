import crypto from 'crypto';
import knex from '../knex';
import { validateEmail } from '../../core/helpers';

const genToken = () =>
  new Promise((resolve, reject) => {
    // eslint-disable-next-line no-confusing-arrow
    crypto.randomBytes(20, (err, buffer) => (err ? reject(err) : resolve(buffer.toString('hex'))));
  });
const hoursValid = 48;

class VerifyEmail {
  constructor(data) {
    this.verificationToken = data.verify_email_token;
    this.expires = data.verify_email_expires;
    this.userId = data.user_id;
    this.email = data.email;
  }

  static async checkToken({ token }) {
    if (!token || typeof token !== 'string') return null;
    const verificationData = await knex.transaction(async (trx) => {
      let data = await trx.where({ verify_email_token: token }).into('verify_emails').select();
      data = data[0];
      if (data) {
        // eslint-disable-next-line newline-per-chained-call
        await knex('verify_emails').transacting(trx).forUpdate().where({ id: data.id }).del('id');
      }
      return data;
    });
    if (!verificationData || new Date(verificationData.verify_email_expires) < new Date()) {
      return null;
    }
    return new VerifyEmail(verificationData);
  }

  static async createToken({ email }) {
    if (!email || typeof email !== 'string') return null;
    if (!validateEmail(email)) return null;
    const verificationToken = await knex.transaction(async (trx) => {
      let userId = await trx.where({ email }).into('users').pluck('id');
      userId = userId[0];
      if (!userId) throw Error('User not found');
      const token = await genToken();
      if (!token) throw Error('Token generation failed');
      const expiration = new Date();
      expiration.setHours(expiration.getHours() + hoursValid);
      // If user exists in table, update
      const exists = await knex('verify_emails')
        .transacting(trx)
        .forUpdate()
        .where({ user_id: userId })
        .pluck('id');

      if (exists[0]) {
        // eslint-disable-next-line newline-per-chained-call
        await knex('verify_emails').transacting(trx).forUpdate().where({ user_id: userId }).update({
          verify_email_token: token,
          verify_email_expires: expiration,
          email,
          updated_at: new Date(),
        });
      } else {
        await knex('verify_emails').transacting(trx).forUpdate().insert({
          verify_email_token: token,
          verify_email_expires: expiration,
          user_id: userId,
          email,
          created_at: new Date(),
        });
      }

      return token || null;
    });
    return verificationToken;
  }
}

export default VerifyEmail;
