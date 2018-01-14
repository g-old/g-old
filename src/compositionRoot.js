import handlebars from 'handlebars';
import nodemailer from 'nodemailer';
import config from '../private_configs';
import knex from './data/knex';
import ActivityRepo from './data/models/Activity';
import EventManager from './core/EventManager';
import ActivityService, { feedOptions } from './core/ActivityService';
import MailComposer from './core/MailComposer';
import MailService from './core/MailService';
import MessageService from './core/MessageService';
import TokenService from './core/TokenService';
import { createToken } from './core/tokens';

const env = process.env.NODE_ENV || 'development';
const mailOptions = config[env].mailer;
const Transporter = nodemailer.createTransport(mailOptions.config);

const messagesRepo = {};
const mailService = new MailService(Transporter);
const mailComposer = new MailComposer(handlebars);
const tokenService = new TokenService(createToken);
export default {
  ActivityService: new ActivityService(
    { dbConnector: knex, eventSrc: EventManager, activityStore: ActivityRepo },
    feedOptions,
  ),
  MailComposer: mailComposer,
  MessageService: new MessageService(
    mailService,
    messagesRepo,
    mailComposer,
    tokenService,
  ),
};
