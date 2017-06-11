import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';
import { PRIVILEGES } from '../../constants';
import Box from '../Box';
import Button from '../Button';

import CheckBox from '../CheckBox';

const messages = defineMessages({
  header: {
    id: 'privilege.header',
    defaultMessage: 'Set & Change Privileges',
    description: 'Header of privilegemanager',
  },
  canUnlockGuest: {
    id: 'privilege.unlockGuest',
    defaultMessage: 'unlock guest',
    description: 'Account can unlock guest rank',
  },
  canUnlockViewer: {
    id: 'privilege.unlockViewer',
    defaultMessage: 'unlock viewer',
    description: 'Account can unlock viewer rank',
  },
  canUnlockUser: {
    id: 'privilege.unlockUser',
    defaultMessage: 'unlock user',
    description: 'Account can unlock user rank',
  },
  canUnlockMod: {
    id: 'privilege.unlockMod',
    defaultMessage: 'unlock mod',
    description: 'Account can unlock mod rank',
  },
  canUnlockAdmin: {
    id: 'privilege.unlockAdmin',
    defaultMessage: 'unlock admin',
    description: 'Account can unlock admin rank',
  },
  canNotifyUser: {
    id: 'privilege.notifyUser',
    defaultMessage: 'notify accounts',
    description: 'Account can send messages to other account',
  },
  canModifyRoles: {
    id: 'privilege.changeRoles',
    defaultMessage: 'change roles',
    description: 'Account can change roles',
  },
  canModifyRights: {
    id: 'privilege.changeRights',
    defaultMessage: 'change rights',
    description: 'Account can change rights',
  },
  canPostProposals: {
    id: 'privilege.postProposals',
    defaultMessage: 'post proposals',
    description: 'Account can post proposals',
  },
  change: {
    id: 'commands.change',
    defaultMessage: 'Change',
    description: 'Short command to change a setting',
  },
});
const readPrivileges = (privilege) => {
  const rights = Object.keys(PRIVILEGES).reduce((acc, curr) => {
    if (curr === 'none') return acc;
    // eslint-disable-next-line no-bitwise
    if (privilege & PRIVILEGES[curr]) {
      // eslint-disable-next-line no-param-reassign
      acc[curr] = true;
    } else {
      // eslint-disable-next-line no-param-reassign
      acc[curr] = false;
    }
    return acc;
  }, {});
  return rights;
};

class PrivilegeManager extends React.Component {
  static propTypes = {
    privilege: PropTypes.number.isRequired,
    updateFn: PropTypes.func.isRequired,
    id: PropTypes.string.isRequired,
  };
  constructor(props) {
    super(props);
    const initialState = readPrivileges(props.privilege);
    this.state = {
      ...initialState,
    };
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  componentWillReceiveProps({ privilege }) {
    const state = readPrivileges(privilege);
    this.setState(state);
  }
  onChange(e) {
    const value = !this.state[e.target.name];
    this.setState({ [e.target.name]: value });
  }

  onSubmit() {
    const privilege = this.state;
    const newPrivilege = Object.keys(privilege).reduce((acc, curr) => {
      const hasRight = privilege[curr];
      if (hasRight) {
        // eslint-disable-next-line no-bitwise
        acc |= PRIVILEGES[curr]; // eslint-disable-line no-param-reassign
      }
      return acc;
    }, 1);
    this.props.updateFn({ id: this.props.id, privilege: newPrivilege });
  }
  render() {
    return (
      <Box column pad>
        <h3><FormattedMessage {...messages.header} /></h3>
        {Object.keys(PRIVILEGES).map((p) => {
          if (p === 'none') {
            return null;
          }
          return (
            <CheckBox
              label={<FormattedMessage {...messages[p]} />}
              checked={this.state[p]}
              onChange={this.onChange}
              name={p}
            />
          );
        })}
        <Button onClick={this.onSubmit} primary label={<FormattedMessage {...messages.change} />} />

      </Box>
    );
  }
}

export default PrivilegeManager;
