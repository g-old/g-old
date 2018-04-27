// @flow
import path from 'path';
import fs from 'fs';
import Module from 'module';
import { throwIfMissing } from './utils';
import translations from '../emails/translations.json';
import type { CommentProps } from '../data/models/Comment';
import type { ProposalProps } from '../data/models/Proposal';
// import type { DiscussionProps } from '../data/models/Discussion';
import type { StatementProps } from '../data/models/Statement';

// taken from https://github.com/kriasoft/nodejs-api-starter/blob/master/src/email.js
function loadTemplate(filename, renderer) {
  const m = new Module(filename);
  // eslint-disable-next-line no-underscore-dangle
  m._compile(fs.readFileSync(filename, 'utf8'), filename);
  return renderer.template(m.exports);
}

type Template = { subject: any => string, html: any => string };
type Translations = { [string]: [string] };
export type EmailHTML = { subject: string, html: string };
type Actor = { fullName: string, thumbnail: ?string };
type StatementMailProps = {
  statement: StatementProps,
  author: Actor,
  proposalTitle: string,
  link: string,
  locale: Locale,
};
type MessageMailProps = {
  message: string,
  sender: Actor,
  title: string,
  locale: Locale,
};
type ProposalMailProps = {
  proposal: ProposalProps,
  link: string,
  locale: Locale,
};

type CommentMailProps = {
  comment: CommentProps,
  author: Actor,
  link: string,
  discussionTitle: string,
  locale: Locale,
};

class MailComposer {
  renderer: any;
  templates: Map<string, Template>;
  translations: Translations;
  baseDir: string;

  constructor(
    renderEngine = throwIfMissing('Template render engine'),
    templateDir,
  ) {
    // TODO change!!!
    const devDir = '../build/emails';
    const productionDir = './emails';
    let dir = productionDir;
    if (__DEV__) {
      dir = devDir;
    }
    this.templates = new Map();
    this.baseDir = path.resolve(__dirname, templateDir || dir);
    this.renderer = renderEngine;
    this.translations = MailComposer.loadTranslations();
    // this.getWelcomeMail = this.getWelcomeMail.bind(this);

    this.renderer.registerHelper('t', (key, options) =>
      options.data.root.t(key),
    );
  }

  static loadTranslations() {
    return translations;
  }
  getWelcomeMail(user, link, locale = 'de-DE') {
    return this.render('welcome', {
      name: user.name,
      link,
      t: key => this.translations[key][locale],
    });
  }
  getResetRequestMail(user, link, locale = 'de-DE') {
    return this.render('resetRequest', {
      name: user.name,
      link,
      t: key => this.translations[key][locale],
    });
  }

  getEmailVerificationMail(user, link, locale = 'de-DE') {
    return this.render('emailVerification', {
      name: user.name,
      link,
      t: key => this.translations[key][locale],
    });
  }

  getResetNotificationMail(user, locale = 'de-DE') {
    return this.render('resetNotification', {
      name: user.name,
      t: key => this.translations[key][locale],
    });
  }
  getProposalMail({ proposal, link, locale = 'de-DE' }: ProposalMailProps) {
    return this.render('proposalNotification', {
      title: proposal.title,
      text: proposal.body,
      link,
      t: key => this.translations[key][locale],
    });
  }

  getStatementMail({
    statement,
    author,
    proposalTitle,
    link,
    locale = 'de-DE',
  }: StatementMailProps) {
    return this.render('statementNotification', {
      name: author.fullName,
      position: statement.position,
      title: proposalTitle,
      text: statement.body,
      thumbnail: author.thumbnail,
      link,
      t: key => this.translations[key][locale],
    });
  }
  getMessageMail({
    message,
    title,
    sender,
    locale = 'de-DE',
  }: MessageMailProps) {
    return this.render('messageNotification', {
      sender: sender.fullName,
      subject: title,
      message,
      thumbnail: sender.thumbnail,
      t: key => this.translations[key][locale],
    });
  }

  getCommentMail({
    comment,
    author,
    link,
    discussionTitle,
    locale,
  }: CommentMailProps) {
    return this.render('commentNotification', {
      name: author.fullName,
      title: discussionTitle,
      text: comment.content,
      thumbnail: author.thumbnail,
      link,
      t: key => this.translations[key][locale],
    });
  }

  loadAllTemplates() {
    fs.readdirSync(this.baseDir).forEach(template => {
      if (fs.statSync(`${this.baseDir}/${template}`).isDirectory()) {
        this.templates.set(template, {
          subject: loadTemplate(
            `${this.baseDir}/${template}/subject.js`,
            this.renderer,
          ),
          html: loadTemplate(
            `${this.baseDir}/${template}/html.js`,
            this.renderer,
          ),
        });
      }
    });
  }

  render(name, context): EmailHTML {
    if (!this.templates.size) {
      this.loadAllTemplates();
    }
    const template = this.templates.get(name);

    if (!template) {
      throw new Error(`The email template '${name}' is missing.`);
    }

    return {
      subject: template.subject(context),
      html: template.html(context),
    };
  }
}

export default MailComposer;
