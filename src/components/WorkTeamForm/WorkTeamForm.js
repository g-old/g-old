import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import { defineMessages, FormattedMessage } from 'react-intl';
import {
  loadWorkTeam,
  updateWorkTeam,
  createWorkTeam,
} from '../../actions/workTeam';
import { findUser } from '../../actions/user';

import {
  getWorkTeam,
  getVisibleUsers,
  getWorkTeamStatus,
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
import { Groups } from '../../organization';

import { selectValidation } from '../../core/validation';
import Notification from '../Notification';
import FormValidation from '../FormValidation';

// import FetchError from '../../components/FetchError';

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
    proposalId: PropTypes.string,
    users: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string }))
      .isRequired,
    workTeam: PropTypes.shape({
      id: PropTypes.string,
      coordinator: PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        surname: PropTypes.string,
      }),
    }).isRequired,
    user: PropTypes.shape({ id: PropTypes.string, groups: PropTypes.number })
      .isRequired,
    findUser: PropTypes.func.isRequired,
    updateWorkTeam: PropTypes.func.isRequired,
    createWorkTeam: PropTypes.func.isRequired,
    updates: PropTypes.shape({
      success: PropTypes.bool,
      error: PropTypes.bool,
    }),
  };

  static defaultProps = {
    updates: null,
    proposalId: null,
  };

  constructor(props) {
    super(props);

    this.handleFormsubmission = this.handleFormsubmission.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.state = {
      ...props.workTeam,
      ...genInitalState(formFields, props.workTeam),
      /*  error: null,
      pending: false,
      success: false, */
    };
  }

  componentWillReceiveProps({ workTeam, updates = {} }) {
    const newUpdates = {};
    if (updates.success && !this.props.updates.success) {
      this.onCancel();
    }
    if (updates.error && !this.props.updates.error) {
      newUpdates.error = true;
    }

    this.setState({ ...workTeam, ...newUpdates });
  }

  // eslint-disable-next-line
  onCancel(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    history.goBack();
  }

  handleFormsubmission(values) {
    // TODO checks
    if (!this.canMutate()) {
      alert('You dont have the necessary permissions');
    }
    const { id, workTeam, proposalId } = this.props;
    // eslint-disable-next-line

    // check coordinator
    const { coordinator } = values;
    /* eslint-disable no-param-reassign */
    if (workTeam.coordinator) {
      // eslint-disable-next-line
      if (
        coordinator &&
        coordinator.id &&
        coordinator.id != workTeam.coordinator.id // eslint-disable-line eqeqeq
      ) {
        values.coordinatorId = coordinator.id;
      }
    } else if (coordinator && coordinator.id) {
      values.coordinatorId = coordinator.id;
      delete values.coordinator;
    }
    if (coordinator) {
      delete values.coordinator;
    }
    /* eslint-enable no-param-reassign */

    if (id) {
      this.props.updateWorkTeam({
        id,
        ...values,
      });
    } else {
      this.props.createWorkTeam({
        ...values,
        proposalId,
      });
    }
  }

  canMutate() {
    const { user, workTeam } = this.props;
    // eslint-disable-next-line no-bitwise
    if (user.groups & Groups.ADMIN) {
      return true;
    }
    // eslint-disable-next-line eqeqeq
    return workTeam.coordinator.id == user.id;
  }

  render() {
    const { error } = this.state;
    const { workTeam, users = [], updates = {} } = this.props;

    const canModify = workTeam && workTeam.id;
    return (
      <Box column padding="medium">
        <Box type="section" align column pad>
          <FormValidation
            submit={this.handleFormsubmission}
            data={workTeam}
            validations={{
              name: { args: { required: true, min: 3 } },
              ...(canModify && {
                restricted: {},
                coordinator: {
                  fn: selectValidation,
                  valuesResolver: obj => obj.state.coordinatorValue,
                  args: { required: true },
                },
              }),
              /*  deName: { args: { min: 3 } },
              itName: { args: { min: 3 } },
              lldName: { args: { min: 3 } },

               */
            }}
          >
            {({
              values,
              handleValueChanges,
              onSubmit,
              onBlur,
              errorMessages,
            }) => (
              <Form>
                <Label>Workteam names</Label>
                <fieldset>
                  <FormField label="Name" error={errorMessages.nameError}>
                    <input
                      type="text"
                      name="name"
                      value={values.name}
                      onChange={handleValueChanges}
                      onBlur={onBlur}
                    />
                  </FormField>
                  {/*  <FormField
                    label="Name german"
                    error={errorMessages.deNameError}
                  >
                    <input
                      type="text"
                      name="deName"
                      value={values.deName}
                      onChange={handleValueChanges}
                      onBlur={onBlur}
                    />
                  </FormField>
                  <FormField
                    label="Name italian"
                    error={errorMessages.itNameError}
                  >
                    <input
                      type="text"
                      name="itName"
                      value={values.itName}
                      onChange={handleValueChanges}
                      onBlur={onBlur}
                    />
                  </FormField>
                  <FormField
                    label="Name ladin"
                    error={errorMessages.lldNameError}
                  >
                    <input
                      type="text"
                      name="lldName"
                      value={values.lldName}
                      onChange={handleValueChanges}
                      onBlur={onBlur}
                    />
                  </FormField> */}
                </fieldset>
                {canModify && <Label>Coordinator</Label>}
                {canModify && (
                  <fieldset>
                    <FormField
                      overflow
                      label="Coordinator"
                      error={errorMessages.coordinatorError}
                    >
                      <SearchField
                        value={
                          workTeam.coordinator
                            ? `${workTeam.coordinator.name} ${workTeam.coordinator.surname}`
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
                )}
                {canModify && <Label>Member access policy</Label>}
                {canModify && (
                  <fieldset>
                    <FormField>
                      <CheckBox
                        label="Restriction"
                        name="restricted"
                        checked={values.restricted}
                        onChange={handleValueChanges}
                        toggle
                      />
                    </FormField>
                  </fieldset>
                )}

                {/* <Label>
                  {mainTeam
                    ? 'Current main team (Rat)'
                    : 'Set as main team (Rat)'}
                </Label>
                <fieldset>
                  <FormField>
                    <CheckBox
                      label="mainTeam"
                      name="mainTeam"
                      checked={values.mainTeam}
                      onChange={handleValueChanges}
                      toggle
                    />
                  </FormField>
                  </fieldset> */}
                <p>
                  {error && (
                    <Notification type="error" message={updates.error} />
                  )}
                </p>
                <Box between>
                  <Button label="Cancel" onClick={this.onCancel} />
                  <Button
                    disabled={updates.pending}
                    primary
                    label="Save"
                    onClick={onSubmit}
                  />
                </Box>
              </Form>
            )}
          </FormValidation>
        </Box>
      </Box>
    );
  }
}

const mapStateToProps = (state, { id }) => ({
  workTeam: getWorkTeam(state, id),
  users: getVisibleUsers(state, 'all'),
  updates: getWorkTeamStatus(state),
  user: getSessionUser(state),
});

const mapDispatch = {
  loadWorkTeam,
  updateWorkTeam,
  findUser,
  createWorkTeam,
};

export default connect(
  mapStateToProps,
  mapDispatch,
)(WorkTeamManagement);
