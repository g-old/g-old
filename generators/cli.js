const componentGenerator = require('./component/index.js');
const resourceGenerator = require('./resource/index.js');

const SafeString = require('./utils/safeString').SafeString;
// const containerGenerator = require('./container/index.js');

module.exports = plop => {
  plop.setGenerator('component', componentGenerator);
  plop.setGenerator('resource', resourceGenerator);
  plop.addHelper('uppercase', text => text.toUpperCase());
  plop.addHelper('getPath', (p, itemName) => {
    const pathParts = p.split('/');
    const index = pathParts.indexOf(itemName);
    const newPath = pathParts.slice(index + 1, pathParts.length);
    return newPath.length < 1 ? `./${newPath}` : `./${newPath.join('/')}/`;
  });
  plop.addHelper('createImports', list => {
    const items = list
      .map(item => `import ${item} from '../${item}';`)
      .join('\n');
    return new SafeString(items);
  });
  plop.addHelper('curly', (object, open) => (open ? '{' : '}'));
  plop.addHelper('brackets', object => `{${object}}`);
};
