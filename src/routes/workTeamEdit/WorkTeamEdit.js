import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import { defineMessages, FormattedMessage } from 'react-intl';
import { defineMessages, FormattedMessage } from 'react-intl';
import {
  loadWorkTeam,
  updateWorkTeam,
  createWorkTeam,
} from '../../actions/workTeam';
import { loadRequestList, deleteRequest } from '../../actions/request';
import { findUser } from '../../actions/user';

import { getWorkTeam, getVisibleUsers } from '../../reducers';
import Box from '../../components/Box';
import FormField from '../../components/FormField';
import Button from '../../components/Button';
import Label from '../../components/Label';
import CheckBox from '../../components/CheckBox';
import SearchField from '../../components/SearchField';
import Form from '../../components/Form';
import history from '../../history';

import {
  nameValidation,
  selectValidation,
  createValidator,
} from '../../core/validation';

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

const formFields = ['name', 'coordinator'];
// TODO Form HOC
const genInitalState = (fields, values) =>
  fields.reduce(
    (acc, curr) => {
      acc[curr] = values[curr] || '';
      acc.errors[curr] = { touched: false };
      return acc;
    },
    { errors: {} },
  );

// TODO EDIT + CREATE should be the same form
class WorkTeamManagement extends React.Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    users: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    workTeam: PropTypes.shape({ id: PropTypes.string }).isRequired,
    findUser: PropTypes.func.isRequired,
    updateWorkTeam: PropTypes.func.isRequired,
    createWorkTeam: PropTypes.func.isRequired,
  };

  static defaultProps = {
    requests: null,
  };
  constructor(props) {
    super(props);
    this.handleValueChanges = this.handleValueChanges.bind(this);
    this.visibleErrors = this.visibleErrors.bind(this);
    this.handleValidation = this.handleValidation.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.state = {
      ...props.workTeam,
      ...genInitalState(formFields, props.workTeam),
    };
    const testValues = {
      name: { fn: 'name' },
      deName: { fn: 'name' },
      itName: { fn: 'name' },
      lldName: { fn: 'name' },

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

  componentWillReceiveProps({ workTeam }) {
    this.setState({ ...workTeam });
  }

  onCancel(e) {
    e.preventDefault();
    e.stopPropagation();
    history.push(`/workTeams/${this.props.workTeam.id}`);
  }

  onSubmit(e) {
    // TODO checks
    e.preventDefault();
    const { workTeam } = this.props;
    const { coordinator } = this.state;
    if (this.handleValidation(formFields)) {
      const inputFields = [
        'id',
        'deName',
        'itName',
        'lldName',
        'mainTeam',
        'restricted',
        'name',
        'coordinatorId',
      ];
      const inputValues = getChangedFields(
        inputFields,
        this.state,
        this.props.workTeam,
      );
      // check coordinator
      if (workTeam.coordinator) {
        // eslint-disable-next-line
        if (coordinator && coordinator.id != workTeam.coordinator.id) {
          inputFields.coordinatorId = coordinator.id;
        }
      } else if (coordinator && coordinator.id) {
        inputValues.coordinatorId = coordinator.id;
      }
      if (this.props.id === 'create') {
        this.props.createWorkTeam({ ...inputValues });
      } else {
        this.props.updateWorkTeam({ id: this.state.id, ...inputValues });
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
      value = e.target.value;
    }

    this.setState({ [e.target.name]: value });
  }

  render() {
    const { lldName, name, deName, itName, restricted, main } = this.state;
    const { workTeam } = this.props;
    const errors = this.visibleErrors(formFields);
    const { users } = this.props;

    return (
      <Box column padding="medium">
        <Box type="section" align column pad>
          <Form onSubmit={this.onSubmit}>
            <Label>{'Workteam names'}</Label>
            <fieldset>
              <FormField label="Name" error={errors.nameError}>
                <input
                  type="text"
                  name="name"
                  value={name}
                  onChange={this.handleValueChanges}
                />
              </FormField>
              <FormField label="Name german">
                <input
                  type="text"
                  name="deName"
                  value={deName}
                  onChange={this.handleValueChanges}
                />
              </FormField>
              <FormField label="Name italian">
                <input
                  type="text"
                  name="itName"
                  value={itName}
                  onChange={this.handleValueChanges}
                />
              </FormField>
              <FormField label="Name ladin">
                <input
                  type="text"
                  name="lldName"
                  value={lldName}
                  onChange={this.handleValueChanges}
                />
              </FormField>
            </fieldset>
            <Label>{'Coordinator'}</Label>
            <fieldset>
              <FormField
                overflow
                label="Coordinator"
                error={errors.coordinatorError}
              >
                <SearchField
                  value={
                    workTeam.coordinator
                      ? `${workTeam.coordinator.name} ${workTeam.coordinator
                          .surname}`
                      : ''
                  }
                  onChange={e =>
                    this.handleValueChanges({
                      target: { name: 'coordinatorValue', value: e.value },
                    })}
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
            <Label>{'Member access policy'}</Label>
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

            <Label>
              {main ? 'Current main team (Rat)' : 'Set as main team (Rat)'}
            </Label>
            <fieldset>
              <FormField>
                <CheckBox
                  label="mainTeam"
                  name="mainTeam"
                  checked={main}
                  onChange={this.handleValueChanges}
                  toggle
                />
              </FormField>
            </fieldset>
            <div>
              <Button primary label="Save" />{' '}
              <Button label="Cancel" onClick={this.onCancel} />
            </div>
          </Form>
        </Box>
      </Box>
    );
  }
}

const mapStateToProps = (state, { id }) => ({
  workTeam: getWorkTeam(state, id),
  users: getVisibleUsers(state, 'all'),
});

const mapDispatch = {
  loadWorkTeam,
  loadRequestList,
  deleteRequest,
  updateWorkTeam,
  findUser,
  createWorkTeam,
};

export default connect(mapStateToProps, mapDispatch)(WorkTeamManagement);
