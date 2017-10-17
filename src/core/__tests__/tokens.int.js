/* eslint-env jest */

import { createTestUser, clearDB } from '../../../test/utils';
import { checkToken } from '../tokens';
import knex from '../../data/knex';

jest.setTimeout(10000);

describe('Tokens', () => {
  describe('checkToken ', () => {
    beforeEach(() => clearDB());
    it('Should not verify a token which does not exist', async () => {
      const res = await checkToken({
        token: 'iamnotatoken',
        table: 'reset_tokens',
      });
      expect(res).toBeFalsy();
    });
    it('Should verify a valid token', async () => {
      const testUser = createTestUser({ id: 1 });
      const testToken = 'iamavalidtoken';
      const testTable = 'reset_tokens';
      const expires = new Date();
      const now = new Date();
      expires.setDate(now.getDate() + 1);
      await knex('users').insert(testUser);
      await knex(testTable).insert({
        user_id: testUser.id,
        token: testToken,
        token_expires: expires,
      });
      const res = await checkToken({
        token: testToken,
        table: testTable,
      });
      expect(res).not.toBeFalsy();
      const tokenInDB = await knex(testTable)
        .where({ token: testToken })
        .select();
      expect(tokenInDB[0]).not.toBeDefined();
    });
  });
});
