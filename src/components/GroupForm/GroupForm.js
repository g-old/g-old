import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import { defineMessages, FormattedMessage } from 'react-intl';
import { defineMessages, FormattedMessage } from 'react-intl';
import { loadGroup, updateGroup, createGroup } from '../../actions/group';
import { findUser } from '../../actions/user';
import Select from '../Select';

import {
  getGroup,
  getVisibleUsers,
  getGroupStatus,
  getSessionUser,
} from '../../reducers';
import Box from '../Box';
import FormField from '../FormField';
import Button from '../Button';
import Label from '../Label';
import CheckBox from '../CheckBox';
import SearchField from '../SearchField';
import Form from '../Form';
import FormValidation from '../FormValidation';

import history from '../../history';

import { selectValidation } from '../../core/validation';
import Notification from '../../components/Notification';

const messages = defineMessages({
  open: {
    id: 'privacy.open',
    defaultMessage: 'Open',
    description: 'Label',
  },
  closed: {
    id: 'privacy.closed',
    defaultMessage: 'Closed',
    description: 'Label',
  },
});

const convertLocalesToNames = (locales, inputValues) => {
  const values = inputValues;
  let dirty = false;
  const names = locales.reduce((acc, field) => {
    if (inputValues[field]) {
      dirty = true;
      acc[field] = inputValues[field];
      delete values[field];
    }
    return acc;
  }, {});
  return dirty ? { ...values, names: JSON.stringify(names) } : inputValues;
};

// TODO EDIT + CREATE should be the same form
class GroupForm extends React.Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    users: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    group: PropTypes.shape({ id: PropTypes.string, names: PropTypes.shape({}) })
      .isRequired,
    user: PropTypes.shape({ id: PropTypes.string }).isRequired,
    findUser: PropTypes.func.isRequired,
    updateGroup: PropTypes.func.isRequired,
    createGroup: PropTypes.func.isRequired,
    updates: PropTypes.shape({
      success: PropTypes.bool,
      error: PropTypes.bool,
    }),
  };

  static defaultProps = {
    updates: null,
  };
  constructor(props) {
    super(props);
    this.onCancel = this.onCancel.bind(this);
    this.handleFormSubmission = this.handleFormSubmission.bind(this);
  }

  // eslint-disable-next-line
  onCancel(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    history.push(`/admin`);
  }

  handleFormSubmission(values) {
    // check coordinator
    /* eslint-disable no-param-reassign */
    const { group, id } = this.props;
    const { coordinator } = values;
    if (group.coordinator) {
      // eslint-disable-next-line
      if (coordinator && coordinator.id != group.coordinator.id) {
        values.coordinatorId = coordinator.id;
      }
    } else if (coordinator && coordinator.id) {
      values.coordinatorId = coordinator.id;
      delete values.coordinator;
    }
    const inputs = convertLocalesToNames(
      ['default_name', 'de-DE', 'it-IT', 'lld-IT'],
      values,
    );
    if (id) {
      inputs.parentGroupId = id;
    }
    /* eslint-enable no-param-reassign */

    this.props.createGroup({ ...inputs });
  }

  render() {
    const { error } = this.state;
    const { group, users = [], updates = {} } = this.props;

    return (
      <Box column padding="medium">
        <Box type="section" align column pad>
          <FormValidation
            submit={this.handleFormSubmission}
            validations={{
              default_name: { args: { required: true, min: 3 } },
              'de-DE': { args: { min: 3 } },
              'it-IT': { args: { min: 3 } },
              'lld-IT': { args: { min: 3 } },
              coordinator: {
                fn: selectValidation,
                valuesResolver: obj => obj.state.coordinatorValue,
                args: { required: true },
              },
              goldMode: {},
            }}
          >
            {({
              handleValueChanges,
              values,
              errorMessages,
              onSubmit,
              onBlur,
            }) => (
              <Form>
                <fieldset>
                  <FormField
                    label="Default name"
                    error={errorMessages.default_nameError}
                  >
                    <input
                      type="text"
                      name="default_name"
                      value={values.default_name}
                      onChange={handleValueChanges}
                      onBlur={onBlur}
                    />
                  </FormField>
                  <FormField
                    label="Name german"
                    error={errorMessages['de-DEError']}
                  >
                    <input
                      type="text"
                      name="de-DE"
                      value={values['de-DE']}
                      onChange={handleValueChanges}
                      onBlur={onBlur}
                    />
                  </FormField>
                  <FormField
                    label="Name italian"
                    error={errorMessages['it-ITError']}
                  >
                    <input
                      type="text"
                      name="it-IT"
                      value={values['it-IT']}
                      onChange={handleValueChanges}
                      onBlur={onBlur}
                    />
                  </FormField>
                  <FormField
                    label="Name ladin"
                    error={errorMessages['lld-ITError']}
                  >
                    <input
                      type="text"
                      name="lld-IT"
                      value={values['lld-IT']}
                      onChange={handleValueChanges}
                      onBlur={onBlur}
                    />
                  </FormField>
                </fieldset>
                <Label>Coordinator</Label>
                <fieldset>
                  <FormField
                    overflow
                    label="Coordinator"
                    error={errorMessages.coordinatorError}
                  >
                    <SearchField
                      value={
                        group.coordinator
                          ? `${group.coordinator.name} ${
                              group.coordinator.surname
                            }`
                          : ''
                      }
                      onChange={e =>
                        handleValueChanges({
                          target: {
                            name: 'coordinatorValue',
                            value: e.value,
                          },
                        })
                      }
                      data={users}
                      fetch={this.props.findUser}
                      displaySelected={data => {
                        handleValueChanges({
                          target: { name: 'coordinator', value: data },
                        });
                      }}
                    />
                  </FormField>
                </fieldset>
                <Label>Privacy</Label>
                <fieldset>
                  <Select
                    inField
                    options={[
                      {
                        value: 'open',
                        label: <FormattedMessage {...messages.open} />,
                      },
                      {
                        value: 'closed',
                        label: <FormattedMessage {...messages.closed} />,
                      },
                    ]}
                    onSearch={false}
                    value={{
                      value: values.privacy,
                      label: values.privacy === 'open' ? 'open' : 'closed',
                    }}
                    onChange={e => {
                      handleValueChanges({
                        target: { name: 'privacy', value: e.value },
                      });
                    }}
                  />
                </fieldset>
                <Label>Mode</Label>
                <fieldset>
                  <FormField>
                    <CheckBox
                      label="Goldmode"
                      name="goldMode"
                      checked={values.goldMode}
                      onChange={handleValueChanges}
                      toggle
                    />
                  </FormField>
                </fieldset>

                <p>
                  {error && (
                    <Notification type="error" message={updates.error} />
                  )}
                </p>
                <div>
                  <Button
                    disabled={updates.pending}
                    onClick={onSubmit}
                    primary
                    label="Save"
                  />
                  <Button label="Cancel" onClick={this.onCancel} />
                </div>
              </Form>
            )}
          </FormValidation>
        </Box>
      </Box>
    );
  }
}

const mapStateToProps = (state, { id }) => ({
  group: getGroup(state, id),
  users: getVisibleUsers(state, 'all'),
  updates: getGroupStatus(state),
  user: getSessionUser(state),
});

const mapDispatch = {
  loadGroup,
  updateGroup,
  findUser,
  createGroup,
};

export default connect(mapStateToProps, mapDispatch)(GroupForm);
