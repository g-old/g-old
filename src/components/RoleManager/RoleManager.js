import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';
import CheckBox from '../CheckBox';
import Box from '../Box';
import Button from '../Button';

const roles = ['admin', 'mod', 'user', 'viewer', 'guest'];

const messages = defineMessages({
  header: {
    id: 'roles.header',
    defaultMessage: 'Set & Change Roles',
    description: 'Header of rolesemanager',
  },
  change: {
    id: 'commands.change',
    defaultMessage: 'Change',
    description: 'Short command to change a setting',
  },
  unlock: {
    id: 'roles.unlock',
    defaultMessage: 'Unlock viewer',
    description: 'Button label for those who can only unlock viewers',
  },
});
const calcState = (roleNames, role) =>
  roleNames.reduce((acc, curr) => {
    if (curr === role) {
      acc[curr] = true;
    } else {
      acc[curr] = false;
    }
    return acc;
  }, {});

class RoleManager extends React.Component {
  static propTypes = {
    userRole: PropTypes.string.isRequired,
    accountRole: PropTypes.string.isRequired,
    accountId: PropTypes.string.isRequired,
    updateFn: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.availableRoles = roles.slice(roles.indexOf(props.userRole) + 1);
    this.state = calcState(this.availableRoles, props.accountRole);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps !== this.props) {
      this.availableRoles = roles.slice(roles.indexOf(nextProps.userRole) + 1);
      const newState = calcState(this.availableRoles, nextProps.accountRole);
      this.setState(newState);
    }
  }
  onChange(e) {
    const newState = calcState(this.availableRoles, e.target.name);
    this.setState(newState);
  }

  onSubmit() {
    const role = Object.keys(this.state).find(key => this.state[key]);
    this.props.updateFn({ id: this.props.accountId, role });
  }
  availableRoles = [];
  render() {
    let promoteButton = null;
    const { userRole } = this.props;
    if (!['admin', 'mod'].includes(userRole)) {
      promoteButton = (
        <Button
          label={<FormattedMessage {...messages.unlockViewer} />}
          onClick={() => this.props.updateFn({ id: this.props.accountId, role: 'viewer' })}
        />
      );
    }

    let checkBoxes = null;
    let changeBtn = null;
    if (!promoteButton) {
      checkBoxes = this.availableRoles.map(r =>
        <CheckBox label={r} checked={this.state[r]} onChange={this.onChange} name={r} />,
      );
      changeBtn = (
        <Button primary onClick={this.onSubmit} label={<FormattedMessage {...messages.change} />} />
      );
    }
    return (
      <Box column pad>
        <h3> <FormattedMessage {...messages.header} /></h3>
        {promoteButton}
        {checkBoxes}
        {changeBtn}

      </Box>
    );
  }
}

export default RoleManager;
