import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import { defineMessages, FormattedMessage } from 'react-intl';
import { defineMessages, FormattedMessage } from 'react-intl';
import { loadPlattform, updatePlattform } from '../../actions/plattform';
import { findUser } from '../../actions/user';

import {
  getPlattformUpdates,
  getVisibleUsers,
  getPlattform,
  getSessionUser,
} from '../../reducers';
import Box from '../../components/Box';
import FormField from '../../components/FormField';
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
class PlattformEdit extends React.Component {
  static propTypes = {
    users: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    plattform: PropTypes.shape({ names: PropTypes.shape({}) }).isRequired,
    user: PropTypes.shape({ id: PropTypes.string }).isRequired,
    findUser: PropTypes.func.isRequired,
    updatePlattform: PropTypes.func.isRequired,
    createPlattform: PropTypes.func.isRequired,
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
      ...props.plattform,
      ...genInitialState(formFields, {
        ...props.plattform,
        ...(props.plattform.names && props.plattform.names),
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

  componentWillReceiveProps({ plattform, updates = {} }) {
    const newUpdates = {};
    if (updates.success && !this.props.updates.success) {
      this.onCancel();
    }
    if (updates.error && !this.props.updates.error) {
      newUpdates.error = true;
    }
    this.setState({
      ...genInitialState(formFields, {
        ...plattform,
        ...(plattform.names && plattform.names),
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
    const { plattform, user } = this.props;
    const { admin } = this.state;
    // eslint-disable-next-line
    if (
      !(
        user.rights.plattform.includes('superuser') ||
        user.rights.plattform.includes('admin')
      )
    ) {
      return;
    }
    if (this.handleValidation(formFields)) {
      const inputFields = ['default_name'];
      const inputValues = getChangedFields(inputFields, this.state, {
        ...this.props.plattform,
        ...(this.props.plattform.names && this.props.plattform.names),
      });
      if (inputValues) {
        if (plattform.admin) {
          // check admin
          // eslint-disable-next-line
          if (admin && admin.id != plattform.admin.id) {
            inputFields.adminId = admin.id;
          }
        } else if (admin && admin.id) {
          inputValues.adminId = admin.id;
        }
        const inputs = convertLocalesToNames(
          ['default_name', 'de-DE', 'it-IT', 'lld-IT'],
          inputValues,
        );
        this.props.updatePlattform({ ...inputs });
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
    const { plattform, users = [], updates = {} } = this.props;
    const errors = this.visibleErrors(formFields);
    return (
      <Box column padding="medium">
        <Box type="section" align column pad>
          <Form onSubmit={this.onSubmit}>
            <Label>Plattform names</Label>
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
            <Label>Admin</Label>
            <fieldset>
              <FormField overflow label="admin" error={errors.adminError}>
                <SearchField
                  value={
                    plattform.admin
                      ? `${plattform.admin.name} ${plattform.admin.surname}`
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
            <p>
              {error && <Notification type="error" message={updates.error} />}
            </p>
            <div>
              <Button disabled={updates.pending} primary label="Save" />{' '}
              <Button label="Cancel" onClick={this.onCancel} />
            </div>
            <Label>Picture</Label>
            <fieldset>
              <FormField overflow label="admin" error={errors.adminError}>
                <SearchField
                  value={
                    plattform.admin
                      ? `${plattform.admin.name} ${plattform.admin.surname}`
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
          </Form>
        </Box>
      </Box>
    );
  }
}

const mapStateToProps = state => ({
  plattform: getPlattform(state),
  users: getVisibleUsers(state, 'all'),
  updates: getPlattformUpdates(state),
  user: getSessionUser(state),
});

const mapDispatch = {
  loadPlattform,
  updatePlattform,
  findUser,
};

export default connect(mapStateToProps, mapDispatch)(PlattformEdit);
