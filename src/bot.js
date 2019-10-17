import knex from './data/knex';
import User from './data/models/User';
import { Permissions, Groups } from './organization';
import log from './logger';

// not sure if this works as expected...
class Bot {
  constructor(email) {
    if (Bot.instance) {
      return Bot.instance;
    }
    Bot.instance = this;
    this.email = email;
  }

  async getBot() {
    if (!this.bot) {
      const [botData = null] = await knex('users')
        .where({ email: this.email })
        .returning('*');
      this.bot = new User({
        ...botData,
        groups: botData.groups | Groups.RELATOR, // for worker

        thumbnail: '/tile.png',
      });
      this.bot.permissions =
        Permissions.VIEW_USER_INFO |
        Permissions.MODIFY_PROPOSALS |
        Permissions.CLOSE_POLLS |
        Permissions.VIEW_PROPOSALS;
    }
    return this.bot;
  }
}

const botInstance = new Bot('vip-bot@example.com');
botInstance
  .getBot()
  .then(bot => log.info(`Bot loaded: ${bot.name} ${bot.surname}`));

export default botInstance;
