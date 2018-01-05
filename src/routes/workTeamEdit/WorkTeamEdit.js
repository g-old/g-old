import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import { defineMessages, FormattedMessage } from 'react-intl';
import { loadWorkTeam, updateWorkTeam } from '../../actions/workTeam';
import { loadRequestList, deleteRequest } from '../../actions/request';
import { getWorkTeam, getVisibleUsers } from '../../reducers';
import Box from '../../components/Box';
import FormField from '../../components/FormField';
import Button from '../../components/Button';
import Label from '../../components/Label';
import CheckBox from '../../components/CheckBox';
import SearchField from '../../components/SearchField';

// import FetchError from '../../components/FetchError';
// TODO EDIT + CREATE should be the same form
class WorkTeamManagement extends React.Component {
  static propTypes = {
    users: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    workTeams: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    findUser: PropTypes.func.isRequired,
    updateWorkTeam: PropTypes.func.isRequired,
  };

  static defaultProps = {
    requests: null,
  };
  constructor(props) {
    super(props);
    this.state = { ...props.workTeams };
    this.onValueChange = this.onValueChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  onValueChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  onSubmit() {
    // TODO checks
    this.props.updateWorkTeam({ ...this.state });
  }

  render() {
    const { lldName, name, deName, itName, restricted, main } = this.state;
    const { users } = this.props;
    return (
      <Box column justify padding="medium">
        <Box column pad>
          <Label>{'Workteam names'}</Label>
          <fieldset>
            <FormField label="Name">
              <input
                type="text"
                name="name"
                value={name}
                onChange={this.onValueChange}
              />
            </FormField>
            <FormField label="Name german">
              <input
                type="text"
                name="deName"
                value={deName}
                onChange={this.onValueChange}
              />
            </FormField>
            <FormField label="Name italian">
              <input
                type="text"
                name="itName"
                value={itName}
                onChange={this.onValueChange}
              />
            </FormField>
            <FormField label="Name ladin">
              <input
                type="text"
                name="lldName"
                value={lldName}
                onChange={this.onValueChange}
              />
            </FormField>
          </fieldset>
          <Label>{'Coordinator'}</Label>
          <FormField overflow label="Coordinator">
            <SearchField
              onChange={e =>
                this.handleValueChanges({
                  target: { name: 'coordinatorId', value: e.value },
                })}
              data={users}
              fetch={this.props.findUser}
              displaySelected={data => {
                this.handleValueChanges({
                  target: { name: 'coordinatorId', value: data },
                });
              }}
            />
          </FormField>
          <Label>{'Member access policy'}</Label>
          <FormField>
            <CheckBox
              label="Restriction"
              name="restricted"
              checked={restricted}
              onChange={this.onCheckBoxChange}
              toggle
            />
          </FormField>

          <Label>
            {main ? 'Current main team (Rat)' : 'Set as main team (Rat)'}
          </Label>
          <FormField>
            <CheckBox
              label="main"
              name="main"
              checked={restricted}
              onChange={this.onCheckBoxChange}
              toggle
            />
          </FormField>
          <Button primary label="Save" onClick={this.onSubmit} />
        </Box>
      </Box>
    );
  }
}

const mapStateToProps = (state, { id }) => ({
  workTeams: getWorkTeam(state, id),
  users: getVisibleUsers(state, 'all'),
});

const mapDispatch = {
  loadWorkTeam,
  loadRequestList,
  deleteRequest,
  updateWorkTeam,
};

export default connect(mapStateToProps, mapDispatch)(WorkTeamManagement);
