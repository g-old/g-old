import crypto from 'crypto';
import knex from '../data/knex';
import { validateEmail } from './helpers';

const genToken = () =>
  new Promise((resolve, reject) => {
    // eslint-disable-next-line no-confusing-arrow
    crypto.randomBytes(20, (err, buffer) => (err ? reject(err) : resolve(buffer.toString('hex'))));
  });

class Token {
  constructor(data) {
    this.token = data.token;
    this.expires = data.token_expires;
    this.userId = data.user_id;
    this.email = data.email || null;
  }
}

export const checkToken = async ({ token, table }) => {
  if (!token || typeof token !== 'string') return null;
  if (!table || typeof table !== 'string') return null;
  const dbData = await knex.transaction(async (trx) => {
    let data = await trx.where({ token }).into(table).select();
    data = data[0];
    if (data) {
      // eslint-disable-next-line newline-per-chained-call
      await knex(table).transacting(trx).forUpdate().where({ id: data.id }).del('id');
    }
    return data;
  });
  if (!dbData || new Date(dbData.token_expires) < new Date()) return null;
  // eslint-disable-next-line new-cap
  return new Token(dbData);
};

export const createToken = async ({ email, table, hoursValid, withEmail }) => {
  if (!email || typeof email !== 'string') return null;
  if (!table || typeof table !== 'string') return null;
  if (!hoursValid || hoursValid < 1 || hoursValid > 72) return null;
  if (!validateEmail(email)) return null;

  const validToken = await knex.transaction(async (trx) => {
    let userId = await trx.where({ email }).into('users').pluck('id');
    userId = userId[0];
    if (!userId) throw Error('User not found');
    const token = await genToken();
    if (!token) throw Error('Token generation failed');
    const expiration = new Date();
    expiration.setHours(expiration.getHours() + hoursValid);
    // If user exists in table, update

    const newData = {
      token,
      token_expires: expiration,
    };
    if (withEmail) {
      newData.email = email;
    }
    const exists = await knex(table)
      .transacting(trx)
      .forUpdate()
      .where({ user_id: userId })
      .pluck('id');

    if (exists[0]) {
      // eslint-disable-next-line newline-per-chained-call
      await knex(table).transacting(trx).forUpdate().where({ user_id: userId }).update({
        ...newData,
        updated_at: new Date(),
      });
    } else {
      await knex(table).transacting(trx).forUpdate().insert({
        ...newData,
        user_id: userId,
        created_at: new Date(),
      });
    }

    return token || null;
  });
  return validToken;
};
