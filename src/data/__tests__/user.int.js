/* eslint-env jest */

import knex from '../knex';
import createLoaders from '../dataLoader';
import { Groups } from '../../organization';
import User from '../models/User';
import { clearDB, createTestActor, createTestUser } from '../../../test/utils';

jest.setTimeout(10000);

describe('User Model', () => {
  beforeEach(() => clearDB());
  describe('User.gen', () => {
    test('Should allow a user to get all the data about himself', async () => {
      const id = 1;
      const testUser = createTestUser({ id });
      await knex('users').insert(testUser);
      const actor = createTestActor({ id });
      const user = await User.gen(actor, testUser.id, createLoaders());
      expect(user).toEqual(
        expect.objectContaining({
          id: actor.id,
          email: actor.email,
          emailVerified: actor.emailVerified,
        }),
      );
    });
  });

  describe('User.create', () => {
    test('Should allow the system to create a new user', async () => {
      const testUserData = { ...createTestUser(), password: 'password' };
      const actor = createTestActor({ id: 2, groups: Groups.SYSTEM });
      const user = await User.create(actor, testUserData, createLoaders());
      expect(user).toEqual(
        expect.objectContaining({ name: testUserData.name }),
      );
    });
  });

  describe('User.update', () => {
    test('Should not update own users email if not valid', async () => {
      const id = 1;

      const testUser = createTestUser({ id });
      await knex('users').insert(testUser);
      const testActor = createTestActor({ id });
      const update = { id: testUser.id, email: 'wrongmail' };
      const result = await User.update(testActor, update, createLoaders());
      expect(result.user).toBe(undefined);
      expect(result.errors).toContain('Wrong argument');
    });
    test('Should update both name and surname ', async () => {
      const id = 2;
      const testName = 'newName';
      const testSurname = 'newSurname';

      const testUser = createTestUser({ id });
      await knex('users').insert(testUser);
      const testActor = createTestActor({ id });
      const update = { id: testUser.id, name: testName, surname: testSurname };
      const result = await User.update(testActor, update, createLoaders());
      expect(result.user).toBeDefined();
      expect(result.user).toEqual(
        expect.objectContaining({ name: testName, surname: testSurname }),
      );
    });
  });
});
