import path from 'path';
import fs from 'fs';
import { throwIfMissing } from './utils';

// taken from https://github.com/kriasoft/nodejs-api-starter/blob/master/src/email.js

class MailComposer {
  constructor(
    renderEngine = throwIfMissing('Template render engine'),
    cssInliner = throwIfMissing('Css Inliner '),
  ) {
    this.templates = new Map();
    this.baseDir = path.resolve(__dirname, '../emails');
    this.renderer = renderEngine;
    this.css = cssInliner;
  }
  getWelcomeMail(user, link) {
    return this.render('welcome', {
      name: user.name,
      link,
    });
  }
  compileEmail(filename) {
    fs.readdirSync('src/emails').forEach(file => {
      if (file.endsWith('.hbs')) {
        const partial = fs
          .readFileSync(`src/emails/${file}`, 'utf8')
          .replace(/{{/g, '\\{{')
          .replace(/\\{{(#block|\/block)/g, '{{$1');
        this.renderer.registerPartial(file.substr(0, file.length - 4), partial);
      }
    });
    const template = fs
      .readFileSync(filename, 'utf8')
      .replace(/{{/g, '\\{{')
      .replace(/\\{{(#extend|\/extend|#content|\/content)/g, '{{$1');
    return this.renderer.precompile(
      this.css(this.renderer.compile(template)({})),
    );
  }
  /*
  getEmailVerificationLink(link, locale, html) {}

  getVerifyEmailMail(user) {}
  */
  loadTemplate(filename) {
    const m = new module.constructor();
    //  console.log('M', m);
    // eslint-disable-next-line no-underscore-dangle
    m._compile(fs.readFileSync(filename, 'utf8'), filename);
    return this.renderer.template(m.exports);
  }

  loadAllTemplates() {
    fs.readdirSync(this.baseDir).forEach(template => {
      if (fs.statSync(`${this.baseDir}/${template}`).isDirectory()) {
        this.templates.set(template, {
          subject: this.loadTemplate(`${this.baseDir}/${template}/subject.hbs`),
          html: this.loadTemplate(`${this.baseDir}/${template}/html.hbs`),
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
