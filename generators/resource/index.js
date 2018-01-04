const path = require('path');
const { trimTemplateFile } = require('../utils/');

module.exports = {
  description: 'Generate a resource',
  prompts: [
    {
      type: 'input',
      name: 'name',
      message: 'What is the name of the resource?',
      default: 'TestResource',
      validate: value => {
        if (/.+/.test(value)) {
          return true;
        }
        return 'The name is required.';
      },
    },
    {
      type: 'checkbox',
      name: 'assets',
      message: 'Choose the assets',
      choices: () => [
        { name: 'Model', value: 'Model', checked: true },
        { name: 'GraphQL', value: 'GraphQL', checked: true },
        { name: 'Query', value: 'Query', checked: true },
        { name: 'ListQuery', value: 'ListQuery', checked: true },
        { name: 'Mutations', value: 'Mutations', checked: true },
        { name: 'Constants', value: 'Constants', checked: true },
        { name: 'Actions', value: 'Actions', checked: true },
        { name: 'Reducers', value: 'Reducers', checked: true },
        { name: 'Imports for schema', value: 'GraphQLSchema', checked: true },
        {
          name: 'Schema for normalizr',
          value: 'normalizrSchema',
          checked: true,
        },
        {
          name: 'Access control',
          value: 'accessControl',
          checked: true,
        },
      ],
    },
    /*  {
      type: 'confirm',
      name: 'wantModel',
      default: true,
      message: 'Want a model?',
    },
    {
      type: 'confirm',
      name: 'wantGraphQL',
      default: true,
      message: 'Want GraphQL types, query and mutations ?',
    },
    {
      type: 'confirm',
      name: 'wantActions',
      default: true,
      message: 'Want actions for query and mutation ?',
    }, */
  ],
  actions: data => {
    const modelPath = path.resolve(process.cwd(), `./src/data/models/`);
    const graphQLTypesPath = path.resolve(process.cwd(), `./src/data/types/`);
    const graphQLQueriesPath = path.resolve(
      process.cwd(),
      `./src/data/queries/`,
    );
    const graphQLMutationsPath = path.resolve(
      process.cwd(),
      `./src/data/mutations/`,
    );
    const actionsPath = path.resolve(process.cwd(), `./src/actions/`);
    const reducerPath = path.resolve(process.cwd(), `./src/reducers/`);
    const constantsPath = path.resolve(
      process.cwd(),
      `./src/constants/index.js`,
    );
    const graphQLSchemaPath = path.resolve(
      process.cwd(),
      `./src/data/schema.js`,
    );

    const normalizrSchemaPath = path.resolve(
      process.cwd(),
      `./src/store/schema.js`,
    );
    const reducerIndexPath = path.resolve(
      process.cwd(),
      './src/reducers/index.js',
    );
    const reducerEntitiesPath = path.resolve(
      process.cwd(),
      './src/reducers/entities.js',
    );
    const reducerUiPath = path.resolve(process.cwd(), './src/reducers/ui/');
    const reducerUiIndexPath = path.resolve(
      process.cwd(),
      './src/reducers/ui.js',
    );

    const accessControlPath = path.resolve(
      process.cwd(),
      './src/core/accessControl.js',
    );

    const actions = [];

    if (data.assets.includes('Model')) {
      actions.push({
        type: 'add',
        path: `${modelPath}/{{properCase name}}.js`,
        templateFile: './resource/model.js.hbs',
        abortOnFail: true,
      });
    }
    if (data.assets.includes('GraphQL')) {
      actions.push({
        type: 'add',
        path: `${graphQLTypesPath}/{{properCase name}}Type.js`,
        templateFile: './resource/graphQLType.js.hbs',
        abortOnFail: true,
      });
      actions.push({
        type: 'add',
        path: `${graphQLTypesPath}/{{properCase name}}InputType.js`,
        templateFile: './resource/graphQLInputType.js.hbs',
        abortOnFail: true,
      });
    }
    if (data.assets.includes('Query')) {
      actions.push({
        type: 'add',
        path: `${graphQLQueriesPath}/{{camelCase name}}.js`,
        templateFile: './resource/query.js.hbs',
        abortOnFail: true,
      });
    }

    if (data.assets.includes('ListQuery')) {
      // Don't know how to pass variable to hbs otherwise
      data.list = true; // eslint-disable-line
      actions.push({
        type: 'add',
        path: `${graphQLQueriesPath}/{{camelCase name}}Connection.js`,
        templateFile: './resource/connection.js.hbs',
        abortOnFail: true,
      });
    }

    if (data.assets.includes('Mutations')) {
      actions.push({
        type: 'add',
        path: `${graphQLMutationsPath}/create{{properCase name}}.js`,
        templateFile: './resource/createMutation.js.hbs',
        abortOnFail: true,
      });
      actions.push({
        type: 'add',
        path: `${graphQLMutationsPath}/update{{properCase name}}.js`,
        templateFile: './resource/updateMutation.js.hbs',
        abortOnFail: true,
      });
      actions.push({
        type: 'add',
        path: `${graphQLMutationsPath}/delete{{properCase name}}.js`,
        templateFile: './resource/deleteMutation.js.hbs',
        abortOnFail: true,
      });
    }

    if (data.assets.includes('Actions')) {
      actions.push({
        type: 'add',
        path: `${actionsPath}/{{camelCase name}}.js`,
        templateFile: './resource/action.js.hbs',
        abortOnFail: true,
      });
    }

    if (data.assets.includes('Constants')) {
      actions.push({
        type: 'modify',
        path: constantsPath,
        pattern: /(\/\* GENERATOR \*\/)/g,
        template: trimTemplateFile('./generators/resource/constants.js.hbs'),
        abortOnFail: true,
      });
    }
    if (data.assets.includes('normalizrSchema')) {
      actions.push({
        type: 'modify',
        path: normalizrSchemaPath,
        pattern: /(\/\* GENERATOR \*\/)/g,
        template: trimTemplateFile('./generators/resource/normalizr.js.hbs'),
        abortOnFail: true,
      });
    }

    if (data.assets.includes('Reducers')) {
      actions.push({
        type: 'add',
        path: `${reducerPath}/{{camelCase name}}s.js`,
        templateFile: './resource/reducersMain.js.hbs',
        abortOnFail: true,
      });
      actions.push({
        type: 'add',
        path: `${reducerPath}/create{{properCase name}}List.js`,
        templateFile: './resource/reducersCreateList.js.hbs',
        abortOnFail: true,
      });
      actions.push({
        type: 'add',
        path: `${reducerPath}/{{camelCase name}}ById.js`,
        templateFile: './resource/reducersbyId.js.hbs',
        abortOnFail: true,
      });
      actions.push({
        type: 'add',
        path: `${reducerUiPath}/{{camelCase name}}s.js`,
        templateFile: './resource/reducerUi.js.hbs',
        abortOnFail: true,
      });
      actions.push({
        type: 'modify',
        path: reducerIndexPath,
        pattern: /(\/\* GENERATOR \*\/)/g,
        template: trimTemplateFile('./generators/resource/reducerIndex.js.hbs'),
        abortOnFail: true,
      });
      actions.push({
        type: 'modify',
        path: reducerEntitiesPath,
        pattern: /(\/\* GENERATOR_EXPORTS \*\/)/g,
        template: trimTemplateFile(
          './generators/resource/reducerEntitiesIndexExports.js.hbs',
        ),
        abortOnFail: true,
      });
      actions.push({
        type: 'modify',
        path: reducerEntitiesPath,
        pattern: /(\/\* GENERATOR_COMBINED \*\/)/g,
        template: trimTemplateFile(
          './generators/resource/reducerCombined.js.hbs',
        ),
        abortOnFail: true,
      });
      actions.push({
        type: 'modify',
        path: reducerEntitiesPath,
        pattern: /(\/\* GENERATOR \*\/)/g,
        template: trimTemplateFile(
          './generators/resource/reducerEntitiesIndexImports.js.hbs',
        ),
        abortOnFail: true,
      });
      actions.push({
        type: 'modify',
        path: reducerUiIndexPath,
        pattern: /(\/\* GENERATOR_IMPORTS \*\/)/g,
        template: trimTemplateFile(
          './generators/resource/reducerUiIndexImports.js.hbs',
        ),
        abortOnFail: true,
      });
      actions.push({
        type: 'modify',
        path: reducerUiIndexPath,
        pattern: /(\/\* GENERATOR_COMBINE \*\/)/g,
        template: trimTemplateFile(
          './generators/resource/reducerCombined.js.hbs',
        ),
        abortOnFail: true,
      });
      actions.push({
        type: 'modify',
        path: reducerUiIndexPath,
        pattern: /(\/\* GENERATOR_EXPORTS \*\/)/g,
        template: trimTemplateFile(
          './generators/resource/reducerUiIndexExports.js.hbs',
        ),
        abortOnFail: true,
      });
    }

    if (data.assets.includes('GraphQLSchema')) {
      actions.push({
        type: 'modify',
        path: graphQLSchemaPath,
        pattern: /(\/\* GENERATOR \*\/)/g,
        template: trimTemplateFile(
          './generators/resource/graphQLImports.js.hbs',
        ),
        abortOnFail: true,
      });
      actions.push({
        type: 'modify',
        path: graphQLSchemaPath,
        pattern: /(\/\* GENERATOR_QUERIES \*\/)/g,
        template: trimTemplateFile(
          './generators/resource/graphQLSchemaAddQuery.js.hbs',
        ),
        abortOnFail: true,
      });
      actions.push({
        type: 'modify',
        path: graphQLSchemaPath,
        pattern: /(\/\* GENERATOR_MUTATIONS \*\/)/g,
        template: trimTemplateFile(
          './generators/resource/graphQLSchemaAddMutations.js.hbs',
        ),
        abortOnFail: true,
      });
    }
    if (data.assets.includes('accessControl')) {
      actions.push({
        type: 'modify',
        path: accessControlPath,
        pattern: /(\/\* GENERATOR_FN \*\/)/g,
        template: trimTemplateFile(
          './generators/resource/accessControlFns.js.hbs',
        ),
        abortOnFail: true,
      });
      actions.push({
        type: 'modify',
        path: accessControlPath,
        pattern: /(\/\* GENERATOR_FILTER \*\/)/g,
        template: trimTemplateFile(
          './generators/resource/accessControlFilter.js.hbs',
        ),
        abortOnFail: true,
      });
    }
    return actions;
  },
};
