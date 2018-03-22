import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import { defineMessages, FormattedMessage } from 'react-intl';
import { defineMessages, FormattedMessage } from 'react-intl';
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

import Button from '../../components/Button';
import Label from '../../components/Label';
import SearchField from '../../components/SearchField';
import Form from '../../components/Form';
import history from '../../history';

import {
  nameValidation,
  selectValidation,
  createValidator,
} from '../../core/validation';
import Notification from '../../components/Notification';

const messages = defineMessages({
  empty: {
    id: 'form.error-empty',
    defaultMessage: "You can't leave this empty",
    description: 'Help for empty fields',
  },
  wrongSelect: {
    id: 'form.error-select',
    defaultMessage: 'You selection is not correct. Click on a suggestion',
    description:
      'Help for selection, when input does not match with a suggestion',
  },
});

// import FetchError from '../../components/FetchError';

const getChangedFields = (inputFields, state, props) =>
  inputFields.reduce((agg, curr) => {
    if (curr in state) {
      if (curr in props) {
        if (state[curr] !== props[curr]) {
          agg[curr] = state[curr]; // eslint-disable-line
        }
      } else {
        agg[curr] = state[curr]; // eslint-disable-line
      }
      // only in state
    }
    return agg;
  }, {});

const formFields = ['default_name'];
// TODO Form HOC
const genInitialState = (fields, values) =>
  fields.reduce(
    (acc, curr) => {
      acc[curr] = values[curr] || '';
      acc.errors[curr] = { touched: false };
      return acc;
    },
    { errors: {} },
  );

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
    createPlatform: PropTypes.func.isRequired,
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
    this.handleValueChanges = this.handleValueChanges.bind(this);
    this.visibleErrors = this.visibleErrors.bind(this);
    this.handleValidation = this.handleValidation.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.state = {
      ...props.platform,
      ...genInitialState(formFields, {
        ...props.platform,
        ...(props.platform.names && props.platform.names),
      }),
    };
    /*  error: null,
      pending: false,
      success: false, */
    const testValues = {
      default_name: { fn: 'name' },
      'de-DE': { fn: 'name' },
      'it-IT': { fn: 'name' },
      'lld-IT': { fn: 'name' },
      admin: { fn: 'admin', valuesResolver: obj => obj.state.adminValue },
      picture: { fn: 'noCheck' },
      defaultGroup: {
        fn: 'group',
        valuesResolver: obj => obj.state.pictureValue,
      },
    };
    this.Validator = createValidator(
      testValues,
      {
        name: nameValidation,
        admin: selectValidation,
        group: selectValidation,
        noCheck: () => {},
      },
      this,
      obj => obj.state,
    );
  }

  componentWillReceiveProps({ platform, updates = {} }) {
    const newUpdates = {};
    if (updates.success && !this.props.updates.success) {
      this.onCancel();
    }
    if (updates.error && !this.props.updates.error) {
      newUpdates.error = true;
    }
    this.setState({
      ...genInitialState(formFields, {
        ...platform,
        ...(platform.names && platform.names),
      }),
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

  onSubmit(e) {
    // TODO checks
    e.preventDefault();
    const { platform, user } = this.props;
    const { admin } = this.state;

    // eslint-disable-next-line
    if (
      !(
        user.rights.platform.includes('superuser') ||
        user.rights.platform.includes('admin')
      )
    ) {
      return;
    }

    if (this.handleValidation(formFields)) {
      const inputFields = ['default_name'];
      const inputValues = getChangedFields(inputFields, this.state, {
        ...this.props.platform,
        ...(this.props.platform.names && this.props.platform.names),
      });
      if (inputValues) {
        if (platform.admin) {
          // check admin
          // eslint-disable-next-line
          if (admin && admin.id != platform.admin.id) {
            inputFields.adminId = admin.id;
          }
        } else if (admin && admin.id) {
          inputValues.adminId = admin.id;
        }
        const inputs = convertLocalesToNames(
          ['default_name', 'de-DE', 'it-IT', 'lld-IT'],
          inputValues,
        );
        this.props.updatePlatform({ ...inputs });
      }
    }
  }

  handleValidation(fields) {
    const validated = this.Validator(fields);
    this.setState({ errors: { ...this.state.errors, ...validated.errors } });
    return validated.failed === 0;
  }

  handleBlur(e) {
    const field = e.target.name;
    if (this.state[field]) {
      this.handleValidation([field]);
    }
  }
  visibleErrors(errorNames) {
    return errorNames.reduce((acc, curr) => {
      const err = `${curr}Error`;
      if (this.state.errors[curr].touched) {
        acc[err] = (
          <FormattedMessage {...messages[this.state.errors[curr].errorName]} />
        );
      }
      return acc;
    }, {});
  }
  handleValueChanges(e) {
    let value;
    if (e.target.type === 'checkbox') {
      value = !this.state[e.target.name];
    } else {
      value = e.target.value; // eslint-disable-line
    }

    this.setState({ [e.target.name]: value });
  }

  render() {
    const { error } = this.state;
    const { platform, users = [], updates = {}, user } = this.props;
    const errors = this.visibleErrors(formFields);
    return (
      <Box column padding="medium">
        <Box type="section" align column pad>
          <Form onSubmit={this.onSubmit}>
            <Label>Platform names</Label>
            <fieldset>
              <FormField label="Default name" error={errors.nameError}>
                <input
                  type="text"
                  name="default_name"
                  value={this.state.default_name}
                  onChange={this.handleValueChanges}
                />
              </FormField>
              <FormField label="Name german">
                <input
                  type="text"
                  name="de-DE"
                  value={this.state['de-DE']}
                  onChange={this.handleValueChanges}
                />
              </FormField>
              <FormField label="Name italian">
                <input
                  type="text"
                  name="it-IT"
                  value={this.state['it-IT']}
                  onChange={this.handleValueChanges}
                />
              </FormField>
              <FormField label="Name ladin">
                <input
                  type="text"
                  name="lld-IT"
                  value={this.state['lld-IT']}
                  onChange={this.handleValueChanges}
                />
              </FormField>
            </fieldset>
            <Label>Gold mode</Label>
            <fieldset>
              <FormField error={errors.goldMode}>
                <CheckBox
                  toggle
                  checked={this.state.goldMode}
                  onChange={() => {
                    alert('TO implement');
                  }}
                  label={this.state.goldMode ? 'ON' : 'OFF'}
                />
              </FormField>
            </fieldset>
            <Label>Contact information</Label>
            <fieldset>
              <FormField label="Email" error={errors.goldMode}>
                <input
                  type="text"
                  name="email"
                  value={this.state.email}
                  onChange={this.handleValueChanges}
                />
              </FormField>
            </fieldset>
            <fieldset>
              <FormField label="Address" error={errors.goldMode}>
                <input
                  type="text"
                  name="address"
                  value={this.state.address}
                  onChange={this.handleValueChanges}
                />
              </FormField>
              <FormField label="Town" error={errors.goldMode}>
                <input
                  type="text"
                  name="town"
                  value={this.state.town}
                  onChange={this.handleValueChanges}
                />
              </FormField>
              <FormField label="Postal Code" error={errors.goldMode}>
                <input
                  type="text"
                  name="postalCode"
                  value={this.state.postalCode}
                  onChange={this.handleValueChanges}
                />
              </FormField>
            </fieldset>
            {user.rights.platform.includes('superuser') && (
              <div>
                <Label>Admin</Label>
                <fieldset>
                  <FormField overflow label="admin" error={errors.adminError}>
                    <SearchField
                      value={
                        platform.admin
                          ? `${platform.admin.name} ${platform.admin.surname}`
                          : ''
                      }
                      onChange={e =>
                        this.handleValueChanges({
                          target: { name: 'adminValue', value: e.value },
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
              {error && <Notification type="error" message={updates.error} />}
            </p>
            <div>
              <Button disabled={updates.pending} primary label="Save" />{' '}
              <Button label="Cancel" onClick={this.onCancel} />
            </div>
          </Form>
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
