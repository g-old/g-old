import crypto from 'crypto';
import knex from '../data/knex';
import { validateEmail } from './helpers';
import { throwIfMissing } from './utils';

const RATE_LIMIT = 60 * 1000;

const genToken = () =>
  new Promise((resolve, reject) => {
    // eslint-disable-next-line no-confusing-arrow
    crypto.randomBytes(
      20,
      (err, buffer) => (err ? reject(err) : resolve(buffer.toString('hex'))),
    );
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
  const dbData = await knex.transaction(async trx => {
    const [data] = await trx
      .where({ token })
      .into(table)
      .select();
    if (data) {
      // eslint-disable-next-line newline-per-chained-call
      await knex(table)
        .transacting(trx)
        .forUpdate()
        .where({ id: data.id })
        .del('id');
    }
    return data;
  });
  if (
    !dbData ||
    new Date(dbData.token_expires).getTime() < new Date().getTime()
  ) {
    return null;
  }
  // eslint-disable-next-line new-cap
  return new Token(dbData);
};

export const createToken = async ({
  email = throwIfMissing('Email'),
  newEmail,
  table = throwIfMissing('Table'),
  hoursValid = throwIfMissing('Hours'),
  withEmail,
}) => {
  if (hoursValid < 1 || hoursValid > 72) {
    throw new Error('Hours not in range 1 - 72');
  }
  if (!validateEmail(email)) {
    throw new Error(`Email not valid: ${email}`);
  }
  const validToken = await knex.transaction(async trx => {
    const [userId] = await trx
      .where({ email })
      .into('users')
      .pluck('id');
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
      newData.email = newEmail;
    }
    const [oldToken = null] = await knex(table)
      .transacting(trx)
      .forUpdate()
      .where({ user_id: userId })
      .select('id', 'created_at', 'updated_at');
    if (oldToken) {
      // cancel if token sent within last hour
      const lastTime = oldToken.updated_at
        ? oldToken.updated_at
        : oldToken.created_at;
      const limit = new Date().getTime() - RATE_LIMIT;
      if (new Date(lastTime) > limit) {
        // TODO return error message
        throw new Error('Token rate limit reached');
      }
      // eslint-disable-next-line newline-per-chained-call
      await knex(table)
        .transacting(trx)
        .forUpdate()
        .where({ user_id: userId })
        .update({
          ...newData,
          updated_at: new Date(),
        });
    } else {
      await knex(table)
        .transacting(trx)
        .forUpdate()
        .insert({
          ...newData,
          user_id: userId,
          created_at: new Date(),
        });
    }

    return token;
  });
  return validToken;
};
