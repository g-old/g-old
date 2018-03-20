import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import { defineMessages, FormattedMessage } from 'react-intl';
import { defineMessages, FormattedMessage } from 'react-intl';
import { loadGroup, updateGroup, createGroup } from '../../actions/group';
import { findUser } from '../../actions/user';

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
    this.handleValueChanges = this.handleValueChanges.bind(this);
    this.visibleErrors = this.visibleErrors.bind(this);
    this.handleValidation = this.handleValidation.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.state = {
      ...props.group,
      ...genInitialState(formFields, {
        ...props.group,
        ...(props.group.names && props.group.names),
      }) /*  error: null,
      pending: false,
      success: false, */,
    };
    const testValues = {
      default_name: { fn: 'name' },
      'de-DE': { fn: 'name' },
      'it-IT': { fn: 'name' },
      'lld-IT': { fn: 'name' },
      coordinator: {
        fn: 'coordinator',
        valuesResolver: obj => obj.state.coordinatorValue,
      },
    };
    this.Validator = createValidator(
      testValues,
      {
        name: nameValidation,
        coordinator: selectValidation,
        noCheck: () => {},
      },
      this,
      obj => obj.state,
    );
  }

  componentWillReceiveProps({ group, updates = {} }) {
    const newUpdates = {};
    if (updates.success && !this.props.updates.success) {
      this.onCancel();
    }
    if (updates.error && !this.props.updates.error) {
      newUpdates.error = true;
    }

    this.setState({
      ...genInitialState(formFields, {
        ...group,
        ...(group.names && group.names),
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
    const { group, id } = this.props;
    const { coordinator } = this.state;
    // eslint-disable-next-line

    if (this.handleValidation(formFields)) {
      const inputFields = ['default_name'];
      const inputValues = getChangedFields(
        inputFields,
        this.state,
        this.props.group,
      );
      // check coordinator
      if (group.coordinator) {
        // eslint-disable-next-line
        if (coordinator && coordinator.id != group.coordinator.id) {
          inputFields.coordinatorId = coordinator.id;
        }
      } else if (coordinator && coordinator.id) {
        inputValues.coordinatorId = coordinator.id;
      }
      const inputs = convertLocalesToNames(
        ['default_name', 'de-DE', 'it-IT', 'lld-IT'],
        inputValues,
      );
      if (id) {
        inputs.parentGroupId = id;
      }

      if (this.props.id) {
        this.props.updateGroup({ id: this.state.id, ...inputs });
      } else {
        this.props.createGroup({ ...inputs });
      }
    } else {
      alert('Validation failed');
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
      value = e.target.value; //eslint-disable-line
    }

    this.setState({ [e.target.name]: value });
  }

  render() {
    const { restricted, error } = this.state;
    const { group, users = [], updates = {} } = this.props;
    const errors = this.visibleErrors(formFields);

    return (
      <Box column padding="medium">
        <Box type="section" align column pad>
          <Form onSubmit={this.onSubmit}>
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
            <Label>Coordinator</Label>
            <fieldset>
              <FormField
                overflow
                label="Coordinator"
                error={errors.coordinatorError}
              >
                <SearchField
                  value={
                    group.coordinator
                      ? `${group.coordinator.name} ${group.coordinator.surname}`
                      : ''
                  }
                  onChange={e =>
                    this.handleValueChanges({
                      target: {
                        name: 'coordinatorValue',
                        value: e.value,
                      },
                    })
                  }
                  data={users}
                  fetch={this.props.findUser}
                  displaySelected={data => {
                    this.handleValueChanges({
                      target: { name: 'coordinator', value: data },
                    });
                  }}
                />
              </FormField>
            </fieldset>
            <Label>Privacy</Label>
            <fieldset>
              <FormField>
                <CheckBox
                  label="Restriction"
                  name="restricted"
                  checked={restricted}
                  onChange={this.handleValueChanges}
                  toggle
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
          </Form>
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
