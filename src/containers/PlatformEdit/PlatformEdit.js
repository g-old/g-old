import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import { defineMessages, FormattedMessage } from 'react-intl';
import { loadPlatform, updatePlatform } from '../../actions/platform';
import { findUser } from '../../actions/user';

import {
  getPlatformUpdates,
  getVisibleUsers,
  getPlatform,
  getSessionUser,
} from '../../reducers';
import Box from '../../components/Box';
import FormField from '../../components/FormField';
import CheckBox from '../../components/CheckBox';
import Select from '../../components/Select';

import Button from '../../components/Button';
import Label from '../../components/Label';
import SearchField from '../../components/SearchField';
import Form from '../../components/Form';
import history from '../../history';
import FormValidation from '../../components/FormValidation';

import { selectValidation, emailValidation } from '../../core/validation';
import Notification from '../../components/Notification';

// import FetchError from '../../components/FetchError';

const convertLocalesToNames = (locales, inputValues) => {
  const values = inputValues;
  let dirty = false;
  const names = locales.reduce((acc, curr) => {
    if (inputValues[curr]) {
      dirty = true;
      acc[curr] = inputValues[curr];
      delete values[curr];
    }
    return acc;
  }, {});
  return dirty ? { ...values, names: JSON.stringify(names) } : inputValues;
};

// TODO EDIT + CREATE should be the same form
class PlatformEdit extends React.Component {
  static propTypes = {
    users: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    platform: PropTypes.shape({ names: PropTypes.shape({}) }).isRequired,
    user: PropTypes.shape({ id: PropTypes.string }).isRequired,
    findUser: PropTypes.func.isRequired,
    updatePlatform: PropTypes.func.isRequired,
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

    this.handleFormSubmission = this.handleFormSubmission.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.state = {};
  }

  componentWillReceiveProps({ updates = {} }) {
    const newUpdates = {};
    if (updates.success && !this.props.updates.success) {
      this.onCancel();
    }
    if (updates.error && !this.props.updates.error) {
      newUpdates.error = true;
    }
    this.setState({
      ...newUpdates,
    });
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
    const { platform } = this.props;

    const { admin } = values;
    if (platform.admin) {
      // eslint-disable-next-line
      if (admin && admin.id != platform.admin.id) {
        values.adminId = admin.id;
      }
    } else if (admin && admin.id) {
      values.adminId = admin.id;
      delete values.admin;
    }
    if (values.admin) {
      delete values.admin;
    }
    if (values.defaultGroup) {
      delete values.defaultGroup;
    }

    const inputs = convertLocalesToNames(
      ['default_name', 'de-DE', 'it-IT', 'lld-IT'],
      values,
    );

    /* eslint-enable no-param-reassign */

    this.props.updatePlatform({ ...inputs });
  }

  render() {
    const { error } = this.state;
    const { platform, users = [], updates = {}, user } = this.props;
    return (
      <Box column padding="medium">
        <Box type="section" align column pad>
          <FormValidation
            data={platform}
            submit={this.handleFormSubmission}
            validations={{
              default_name: { args: { required: true, min: 3 } },
              'de-DE': { args: { min: 3 } },
              'it-IT': { args: { min: 3 } },
              'lld-IT': { args: { min: 3 } },
              goldMode: {},
              admin: {
                fn: selectValidation,
                valuesResolver: obj => obj.state.adminValue,
                args: { required: true },
              },
              email: { fn: emailValidation, args: { required: true } },
              address: {},
              town: {},
              postalCode: {},
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
                <Label>Platform names</Label>
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
                    error={errorMessages['de-DeError']}
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
                <Label>Settings</Label>
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
                <fieldset>
                  <FormField
                    label="Default group"
                    error={errorMessages.defaultGroupError}
                  >
                    <Select
                      inField
                      options={
                        platform.mainGroups
                          ? platform.mainGroups.map(g => ({
                              label: g.displayName,
                              value: g.id,
                            }))
                          : []
                      }
                      onSearch={false}
                      value={values.defaultGroup}
                      onChange={e => {
                        handleValueChanges({
                          target: { name: 'defaultGroup', value: e.value },
                        });
                      }}
                    />
                  </FormField>
                </fieldset>
                <Label>Contact information</Label>
                <fieldset>
                  <FormField label="Email" error={errorMessages.emailError}>
                    <input
                      type="text"
                      name="email"
                      value={values.email}
                      onChange={handleValueChanges}
                      onBlur={onBlur}
                    />
                  </FormField>
                </fieldset>
                <fieldset>
                  <FormField label="Address" error={errorMessages.addressError}>
                    <input
                      type="text"
                      name="address"
                      value={values.address}
                      onChange={handleValueChanges}
                      onBlur={onBlur}
                    />
                  </FormField>
                  <FormField label="Town" error={errorMessages.townError}>
                    <input
                      type="text"
                      name="town"
                      value={values.town}
                      onChange={handleValueChanges}
                      onBlur={onBlur}
                    />
                  </FormField>
                  <FormField
                    label="Postal Code"
                    error={errorMessages.postalCodeError}
                  >
                    <input
                      type="text"
                      name="postalCode"
                      value={values.postalCode}
                      onChange={handleValueChanges}
                      onBlur={onBlur}
                    />
                  </FormField>
                </fieldset>
                {user.rights.platform.includes('superuser') && (
                  <div>
                    <Label>Admin</Label>
                    <fieldset>
                      <FormField
                        overflow
                        label="admin"
                        error={errorMessages.adminError}
                      >
                        <SearchField
                          value={
                            platform.admin
                              ? `${platform.admin.name} ${
                                  platform.admin.surname
                                }`
                              : ''
                          }
                          onChange={e =>
                            this.handleValueChanges({
                              target: {
                                name: 'adminValue',
                                value: e.value,
                              },
                            })
                          }
                          data={users}
                          fetch={this.props.findUser}
                          displaySelected={data => {
                            this.handleValueChanges({
                              target: { name: 'admin', value: data },
                            });
                          }}
                        />
                      </FormField>
                    </fieldset>
                  </div>
                )}
                <p>
                  {error && (
                    <Notification type="error" message={updates.error} />
                  )}
                </p>
                <div>
                  <Button
                    onClick={onSubmit}
                    disabled={updates.pending}
                    primary
                    label="Save"
                  />{' '}
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

const mapStateToProps = state => ({
  platform: getPlatform(state),
  users: getVisibleUsers(state, 'all'),
  updates: getPlatformUpdates(state),
  user: getSessionUser(state),
});

const mapDispatch = {
  loadPlatform,
  updatePlatform,
  findUser,
};

export default connect(mapStateToProps, mapDispatch)(PlatformEdit);
