/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Layout from '../../components/Layout';
import { getSessionUser } from '../../reducers';
import { canAccess } from '../../organization';
import MainEditor from '../../components/MainEditor';
import { isHtmlEmpty } from '../../components/MessageInput/validationFns';
import Box from '../../components/Box';
import FormValidation from '../../components/FormValidation';
import FormField from '../../components/FormField';
import Heading from '../../components/Heading';
import Menu from '../../components/Menu';
import Button from '../../components/Button';
import Form from '../../components/Form';
import Select from '../../components/Select';
import Layer from './layerExample';
import Tab from '../../components/Tab/Tab';
import Tabs from '../../components/Tabs/Tabs';
import AssetsTable from '../../components/AssetsTable';
import TableRow from '../../components/TableRow';
import Accordion from '../../components/Accordion';
import AccordionPanel from '../../components/AccordionPanel';
import CheckBox from '../../components/CheckBox/CheckBox';
import SearchField from '../../components/SearchField';

const title = 'Private';

const bodyValidation = (data, state) => {
  let result = { touched: false };
  if (isHtmlEmpty(data) && !state.withOptions) {
    result = { touched: true, errorName: 'empty' };
  }
  return result;
};

class TRow extends React.Component {
  render() {
    const { name } = this.props;
    return (
      <TableRow>
        <td>Hello</td>
        <td>{name}</td>
        <td>{name}</td>
        <td>{name}</td>
      </TableRow>
    );
  }
}

TRow.propTypes = { name: PropTypes.string.isRequired };

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
        <Box column align>
          <Heading tag="h1">Showroom</Heading>
          <Box>
            <Button primary> Primary Button</Button>
            <Button> Secondary Button</Button>
            <Button accent> Accent Button</Button>
          </Box>
          <Heading tag="h2">Editor</Heading>
          <Box>
            <Form>
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
                          handleValueChanges({
                            target: { name: 'body', value },
                          });
                        }}
                      />
                    </FormField>
                  </Box>
                )}
              </FormValidation>
            </Form>
          </Box>
          <Heading tag="h2">Menu</Heading>

          <Box align>
            <Menu label="Menu">
              <Button plain>Hello</Button>
              <Button>World</Button>
            </Menu>
            <Menu label="Menu with button" withControl>
              <Button>Hello</Button>
              <Button plain>World</Button>
            </Menu>
            <Menu label="Menu primary" primary>
              <Button>Hello</Button>
              <Button plain>World</Button>
            </Menu>
          </Box>
          <Heading tag="h2">Select</Heading>

          <Box>
            <Select
              options={['option1', 'option2', 'option3', 'option4']}
              placeHolder="Choose"
            />
          </Box>
          <Heading tag="h2">Layers</Heading>

          <Box>
            <Layer>
              <Box>
                <Heading tag="h3">I am a layer</Heading>
              </Box>
            </Layer>
          </Box>
          <Box>
            <CheckBox label="Checkbox" />
            <CheckBox toggle label="Toogle" />
          </Box>
          <Box>
            <SearchField
              fetch={values => console.info(`${'fetching '}${values}`)}
              data={[{ name: 'Tom' }, { name: 'Franz' }]}
              placeHolder="Search for Tom or Franz"
            />
          </Box>
          <Heading tag="h2">Tabs</Heading>

          <Box>
            <Tabs>
              <Tab title="Say">Hello</Tab>
              <Tab title="Get">World</Tab>
              <Tab title="Open">!!!</Tab>
            </Tabs>
          </Box>
          <Heading tag="h2">Table</Heading>

          <Box>
            <AssetsTable
              allowMultiSelect
              searchTerm=""
              noRequestsFound="No requests found"
              checkedIndices={[]}
              assets={[
                { name: 'firstname' },
                { name: 'secondname' },
                { name: 'thirdname' },
              ]}
              row={TRow}
              tableHeaders={['columnA', 'columnB', 'columnC', 'columnD']}
            />
          </Box>
          <Box fill>
            <AssetsTable
              allowMultiSelect
              searchTerm=""
              noRequestsFound="No requests found"
              checkedIndices={[]}
              assets={[
                { name: 'firstname' },
                { name: 'secondname' },
                { name: 'thirdname' },
              ]}
              row={TRow}
              tableHeaders={['columnA', 'columnB', 'columnC', 'columnD']}
            />
          </Box>
          <Heading tag="h2">Accordion</Heading>

          <Box fill>
            <Accordion>
              <AccordionPanel heading="panelA">This is Panel A</AccordionPanel>
              <AccordionPanel heading="panelB">This is Panel B</AccordionPanel>
            </Accordion>
          </Box>
        </Box>
      </Layout>
    ),
  };
}

export default action;
