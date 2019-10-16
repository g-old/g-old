import knex from './data/knex';
import User from './data/models/User';
import { Permissions } from './organization';
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
        permissions: Permissions.VIEW_USER_INFO,
        thumbnail: '/tile.png',
      });
    }
    return this.bot;
  }
}

const botInstance = new Bot('vip-bot@example.com');
botInstance
  .getBot()
  .then(bot => log.info(`Bot loaded: ${bot.name} ${bot.surname}`));

export default botInstance;
