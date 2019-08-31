/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import Layout from '../../components/Layout';
import { getSessionUser } from '../../reducers';
import { canAccess } from '../../organization';
import MainEditor from '../../components/MainEditor';
import { isHtmlEmpty } from '../../components/MessageInput/validationFns';
import Box from '../../components/Box';
import FormValidation from '../../components/FormValidation';
import FormField from '../../components/FormField';

const title = 'Private';

const bodyValidation = (data, state) => {
  let result = { touched: false };
  if (isHtmlEmpty(data) && !state.withOptions) {
    result = { touched: true, errorName: 'empty' };
  }
  return result;
};

async function action({ store }) {
  const state = store.getState();

  const user = getSessionUser(state);

  if (user) {
    if (!canAccess(user, title)) {
      return { redirect: '/account' };
    }
  } else {
    return { redirect: '/home' };
  }
  return {
    chunks: ['private'],
    title,
    component: (
      <Layout>
        Private Area
        <FormValidation
          ref={this.form}
          submit={this.handleNext}
          validations={{
            body: { fn: bodyValidation, args: { required: true } },
            title: { args: { required: true, min: 3 } },
            withOptions: {}, // hack to circumvent isEmpty check
          }}
          data={{
            body: '<p></p>',
            title: 'Start typing',
          }}
        >
          {({ handleValueChanges, values, errorMessages }) => (
            <Box column>
              <FormField label="Title" error={errorMessages.titleError}>
                <input
                  name="title"
                  type="text"
                  value={values.title}
                  onChange={handleValueChanges}
                />
              </FormField>
              <FormField error={errorMessages.bodyError} label="Body">
                <MainEditor
                  ref={
                    elm => (this.editor = elm) // eslint-disable-line
                  }
                  value={values.body}
                  onChange={value => {
                    handleValueChanges({ target: { name: 'body', value } });
                  }}
                />
              </FormField>
            </Box>
          )}
        </FormValidation>
      </Layout>
    ),
  };
}

export default action;
