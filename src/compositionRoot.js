import handlebars from 'handlebars';
import nodemailer from 'nodemailer';
import config from './config';
import knex from './data/knex';
import ActivityRepo from './data/models/Activity';
import EventManager from './core/EventManager';
import ActivityService, { feedOptions } from './core/ActivityService';
import MailComposer from './core/MailComposer';
import MailService from './core/MailService';
import MessageService from './core/MessageService';
import TokenService from './core/TokenService';
import BackgroundService from './core/BackgroundService';
import NotificationService from './core/NotificationService';
import { createToken } from './core/tokens';

const env = process.env.NODE_ENV || 'development';
const mailOptions = config.mailer;

const USE_SENDGRID = 'test';
let Transporter;
if (env === 'production' || env === USE_SENDGRID) {
  Transporter = require('./core/SendGridTransporter').default; // eslint-disable-line global-require
} else {
  Transporter = nodemailer.createTransport(mailOptions.config);
}

const messagesRepo = {};
const mailService = new MailService(Transporter);
const mailComposer = new MailComposer(handlebars);
const tokenService = new TokenService(createToken);
const messageService = new MessageService(
  mailService,
  messagesRepo,
  mailComposer,
  tokenService,
);
const notificationService = new NotificationService({
  eventManager: EventManager,
  dbConnector: knex,
});
const backgroundService = new BackgroundService(messageService);
export default {
  ActivityService: new ActivityService(
    { dbConnector: knex, eventSrc: EventManager, activityStore: ActivityRepo },
    feedOptions,
  ),
  MailComposer: mailComposer,
  MessageService: messageService,
  BackgroundService: backgroundService,
  NotificationService: notificationService,
};
