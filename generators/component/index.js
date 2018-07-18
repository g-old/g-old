const path = require('path');

module.exports = {
  description: 'Generate a component',
  prompts: [
    {
      type: 'list',
      name: 'type',
      message: 'Select the type of component',
      default: 'Stateless Function',
      choices: () => ['ES6 Class', 'Stateless Function'],
    },
    {
      type: 'input',
      name: 'path',
      message: 'What directory would you like your component in? (relative)',
      default: './src/components',
      validate: value => true, // eslint-disable-line
    },
    {
      type: 'input',
      name: 'name',
      message: 'What is the name of the component?',
      default: 'Post',
      validate: value => {
        if (/.+/.test(value)) {
          return true;
        }
        return 'The name is required.';
      },
    },
    {
      type: 'checkbox',
      name: 'imports',
      message: 'Would you like to import any commonly used grommet components?',
      choices: () => [
        { name: 'Anchor', value: 'Anchor', checked: false },
        { name: 'Article', value: 'Article', checked: false },
        { name: 'Button', value: 'Button', checked: false },
        { name: 'Card', value: 'Card', checked: false },
        { name: 'Heading', value: 'Heading', checked: false },
        { name: 'Header', value: 'Header', checked: false },
        { name: 'Box', value: 'Box', checked: false },
      ],
    },
    {
      type: 'confirm',
      name: 'wantCss',
      default: true,
      message: 'Should the component include a css-file?',
    },
    {
      type: 'confirm',
      name: 'wantFlowTypes',
      default: true,
      message: 'Should the component have FlowTypes?',
    },
  ],
  actions: data => {
    const componentPath = path.resolve(
      process.cwd(),
      `${data.path}/{{properCase name}}/`,
    );
    /* const rootPath = path.resolve(
      process.cwd(),
      `./src/js/components/index.js`,
    ); */
    const actions = [
      {
        type: 'add',
        path: `${componentPath}/{{properCase name}}.js`,
        templateFile:
          data.type === 'ES6 Class'
            ? './component/es6class.js.hbs'
            : './component/stateless.js.hbs',
        abortOnFail: true,
      },

      {
        type: 'add',
        path: `${componentPath}/package.json`,
        templateFile: './component/packageFile.js.hbs',
        abortOnFail: true,
      },
    ];

    if (data.wantCss) {
      actions.push({
        type: 'add',
        path: `${componentPath}/{{properCase name}}.css`,
        templateFile: './component/cssFile.js.hbs',
        abortOnFail: true,
      });
    }
    if (data.wantJestTests) {
      actions.push({
        type: 'add',
        path: `${componentPath}/tests/index.test.js`,
        templateFile: './component/test.js.hbs',
        abortOnFail: true,
      });
    }
    return actions;
  },
};
