import fs from 'fs';
import juice from 'juice';
import path from 'path';
import handlebars from 'handlebars';
import handlebarsLayouts from 'handlebars-layouts';
import { makeDir } from './lib/fs';

const compileEmail = filename => {
  fs.readdirSync('src/emails').forEach(file => {
    if (file.endsWith('.hbs')) {
      // read layout file
      const partial = fs
        .readFileSync(`src/emails/${file}`, 'utf8')
        .replace(/{{/g, '\\{{')
        .replace(/\\{{(#block|\/block)/g, '{{$1')
        .replace(/-brand-/, process.env.HOST || 'localhost:3000')
        .replace(
          /-webpage-/,
          process.env.HOST
            ? `https://${process.env.HOST}`
            : 'http://localhost:3000',
        )
        .replace(
          /-address-/,
          'Associazione Movimento 5 Stelle Alto Adige/Südtirol, Viale Venezia, n. 41, 39100 Bolzano',
        );

      handlebars.registerPartial(file.substr(0, file.length - 4), partial);
    }
  });
  const template = fs
    .readFileSync(filename, 'utf8')
    .replace(/{{/g, '\\{{')
    .replace(/\\{{(#extend|\/extend|#content|\/content)/g, '{{$1');
  return handlebars.precompile(juice(handlebars.compile(template)({})));
};

const emailPath = path.resolve(__dirname, '../src/emails');
const destPath = path.resolve(__dirname, '../build/emails');

handlebarsLayouts.register(handlebars);

const compileFile = async (folder, filePath, destinationPath) => {
  const template = compileEmail(filePath);
  // write it to build;
  if (!fs.existsSync(folder)) {
    await makeDir(folder);
  }
  fs.writeFileSync(destinationPath, `module.exports = ${template};`, 'utf8');
};

async function compile() {
  if (!fs.existsSync(destPath)) {
    await makeDir(destPath);
  }

  fs.readdirSync(emailPath).forEach(async folder => {
    if (fs.statSync(`${emailPath}/${folder}`).isDirectory()) {
      await compileFile(
        `${destPath}/${folder}/`,
        `${emailPath}/${folder}/subject.hbs`,
        `${destPath}/${folder}/subject.js`,
      );
      console.info(
        `${emailPath}/${folder}/subject.hbs --> ${destPath}/${folder}/subject.js`,
      );
      await compileFile(
        `${destPath}/${folder}/`,
        `${emailPath}/${folder}/html.hbs`,
        `${destPath}/${folder}/html.js`,
      );
      console.info(
        `${emailPath}/${folder}/html.hbs --> ${destPath}/${folder}/html.js`,
      );
    }
  });
}

export default compile;
