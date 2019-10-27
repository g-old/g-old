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
import Toast from './toastExample';
import Tab from '../../components/Tab/Tab';
import Tabs from '../../components/Tabs/Tabs';
import AssetsTable from '../../components/AssetsTable';
import TableRow from '../../components/TableRow';
import Accordion from '../../components/Accordion';
import AccordionPanel from '../../components/AccordionPanel';
import CheckBox from '../../components/CheckBox/CheckBox';
import SearchField from '../../components/SearchField';
import Card from '../../components/Card';
import Uploader from '../../components/Uploader';

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
        <Box>
          <div style={{ backgroundColor: 'grey', width: '15em' }}>
            SideArea{' '}
            <img alt="icon" style={{ width: '100%' }} src="/tile.png" />
            <img alt="icon" style={{ width: '100%' }} src="/tile.png" />
            <img alt="icon" style={{ width: '100%' }} src="/tile.png" />{' '}
          </div>
          Private Area
          <Box column align>
            <Heading tag="h1">Showroom</Heading>
            <Box wrap justify>
              <Button primary> Primary Button</Button>
              <Button> Secondary Button</Button>
              <Button accent> Accent Button</Button>
            </Box>
            <Heading tag="h2">Editor</Heading>
            <Box fill align justify>
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
                <AccordionPanel heading="panelA">
                  This is Panel A
                </AccordionPanel>
                <AccordionPanel heading="panelB">
                  This is Panel B
                </AccordionPanel>
              </Accordion>
            </Box>
            <Box>
              <Card>Some nice text on a Card</Card>
              <Card>Some nice text on a Card</Card>
              <Card>Some nice text on a Card</Card>
            </Box>
            <Heading tag="h2">Toast</Heading>
            <Box>
              <Toast label="Top down toast" />
              <Toast bottom label="Bottom up toast" />
            </Box>
            <Heading tag="h2">File Uploader</Heading>

            <Box fill>
              <Uploader multiple />
            </Box>
            <Box fill>
              <div style={{ flex: 1, display: 'flex', backgroundColor: 'red' }}>
                <div
                  style={{
                    width: '100%',
                    height: '10em',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'end',
                    flexDirection: 'column',
                    padding: '1em',
                  }}
                >
                  <span>Eins</span>
                  <div
                    style={{
                      backgroundSize: 'cover',
                      width: '100%',
                      height: '100%',
                      maxHeight: '5em',
                      backgroundImage: 'url("/tile.png")',
                    }}
                  />
                </div>
                <div
                  style={{
                    width: '100%',
                    backgroundColor: 'orange',
                    height: '10em',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'end',
                    flexDirection: 'column',
                    padding: '1em',
                  }}
                >
                  <span
                    style={{
                      display: 'flex',
                      alignSelf: 'center',
                    }}
                  >
                    Eineinhalb
                  </span>
                  <div
                    style={{
                      backgroundSize: 'cover',
                      width: '100%',
                      height: '100%',
                      maxHeight: '5em',
                      backgroundImage: 'url("/tile.png")',
                    }}
                  />
                  {/* <img
                  style={{ width: '50%' }}
                  src="https://karrierebibel.de/wp-content/uploads/2017/09/Regelmaessiger-Schlaf-Schlafdauer-Schlafmenge-Grafik-650x433.png"
               /> */}
                </div>
                <div
                  style={{
                    width: '100%',
                    backgroundColor: 'chartreuse',
                    height: '5em',
                  }}
                >
                  Eindreiviertel
                </div>
              </div>
              <div
                style={{
                  flex: 0.3,
                  display: 'flex',
                  backgroundColor: 'yellow',
                }}
              >
                Zwei
              </div>
            </Box>
          </Box>
        </Box>
      </Layout>
    ),
  };
}

export default action;
