import path from 'path';
import fs from 'fs';
import Module from 'module';
import { throwIfMissing } from './utils';
import translations from '../emails/translations.json';

// taken from https://github.com/kriasoft/nodejs-api-starter/blob/master/src/email.js
function loadTemplate(filename, renderer) {
  const m = new Module(filename);
  // eslint-disable-next-line no-underscore-dangle
  m._compile(fs.readFileSync(filename, 'utf8'), filename);
  return renderer.template(m.exports);
}

class MailComposer {
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
    this.getWelcomeMail = this.getWelcomeMail.bind(this);

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
  getMessageMail(user, message, sender, locale = 'de-DE') {
    return this.render('message', {
      name: user.name,
      sender: `${sender.name} ${sender.surname}`,
      ...(message.subject && { subject: message.subject }),
      message: message.content,
      t: key => this.translations[key][locale],
    });
  }
  getNotificationMail(user, message, sender, locale) {
    console.error('TO IMPLEMENT');
    return this.getMessageMail(user, message, sender, locale);
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

  render(name, context) {
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
