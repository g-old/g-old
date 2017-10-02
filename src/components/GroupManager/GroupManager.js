import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';
import CheckBox from '../CheckBox';
import Box from '../Box';
import Button from '../Button';
import FormField from '../FormField';
// import { PRIVILEGES } from '../../constants';
import {
  Groups,
  canChangeGroups,
  Privileges,
  GroupConditions,
} from '../../organization';

const messages = defineMessages({
  role: {
    id: 'account.role',
    defaultMessage: 'Role',
    description: 'Role of the user',
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
  error: {
    id: 'notifications.error.undefined',
    defaultMessage: 'Something went wrong',
    description: 'Server or network error ',
  },
});

const calcState = (roleNames, role) =>
  roleNames.reduce((acc, curr) => {
    // eslint-disable-next-line no-bitwise
    if (Groups[curr] & role) {
      acc[curr] = { status: true, value: Groups[curr] };
    } else {
      acc[curr] = { status: false, value: Groups[curr] };
    }
    return acc;
  }, {});

// eslint-disable-next-line eqeqeq
const getGroupName = group => Object.keys(Groups).find(c => Groups[c] == group);
// TODO memotize
const getAvailableGroups = user =>
  Object.keys(Privileges).reduce((acc, curr) => {
    // eslint-disable-next-line no-bitwise
    if (user.privileges & Privileges[curr]) {
      const group = Object.keys(GroupConditions).find(
        c => GroupConditions[c] === Privileges[curr],
      );
      if (group) {
        const groupname = getGroupName(group);
        acc.push(groupname);
      }
    }
    return acc;
  }, []);

class GroupManager extends React.Component {
  static propTypes = {
    account: PropTypes.shape({
      groups: PropTypes.number,
      id: PropTypes.string,
    }).isRequired,
    user: PropTypes.shape({
      groups: PropTypes.number,
      id: PropTypes.string,
    }).isRequired,

    updateFn: PropTypes.func.isRequired,
    updates: PropTypes.shape({
      error: PropTypes.bool,
      pending: PropTypes.bool,
    }),
  };
  static defaultProps = {
    updates: {},
  };

  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.availableGroups = getAvailableGroups(props.user);
    this.state = calcState(this.availableGroups, props.account.groups);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.updates && nextProps.updates.error) {
      const old = this.props.updates || {};
      this.setState({ error: !old.error });
    }
    if (nextProps !== this.props) {
      this.availableGroups = getAvailableGroups(this.props.user);
      const newState = calcState(
        this.availableGroups,
        nextProps.account.groups,
      );
      this.setState(newState);
    }
  }

  onChange(e) {
    const {
      user,
      account: { groups, id, emailVerified, workTeams, avatar },
    } = this.props;
    // TODO VALIDATION FN
    // dont allow change from guest if no profile, no workteam and no email verification
    /* eslint-disable no-bitwise */
    if (
      (user.groups & (Groups.ADMIN | Groups.SUPER_USER)) > 0 ||
      (emailVerified && avatar && workTeams && workTeams.length)
    ) {
      if (this.state[e.target.name].status === true) {
        // remove
        if (groups & this.state[e.target.name].value) {
          const updatedGroups = groups & ~Groups[e.target.name];
          if (canChangeGroups(user, this.props.account, updatedGroups)) {
            this.props.updateFn({ id, groups: updatedGroups });
          }
        }
      } else if ((groups & this.state[e.target.name].value) === 0) {
        // assign
        const updatedGroups = groups | Groups[e.target.name];
        if (canChangeGroups(user, this.props.account, updatedGroups)) {
          this.props.updateFn({ id, groups: updatedGroups });
        }
      }
    }
    /* eslint-enable no-bitwise */
  }

  render() {
    let promoteButton = null;
    const { user, updates, account } = this.props;
    if (
      (user.privileges & Groups.MEMBER_MANAGER) > 0 && // eslint-disable-line no-bitwise
      account.groups === Groups.USER
    ) {
      promoteButton = (
        <Button
          primary
          label={<FormattedMessage {...messages.unlock} />}
          onClick={() =>
            this.onChange({ target: { name: getGroupName(Groups.VIEWER) } })}
        />
      );
    }

    const error = this.state.error && <FormattedMessage {...messages.error} />;
    let input;
    if (promoteButton) {
      input = promoteButton;
    } else {
      input = (
        <FormField
          label={<FormattedMessage {...messages.role} />}
          error={error}
        >
          {!promoteButton &&
            this.availableGroups.map(r => (
              <CheckBox
                label={r}
                disabled={updates && updates.pending}
                checked={this.state[r].status}
                onChange={this.onChange}
                name={r}
              />
            ))}
        </FormField>
      );
    }

    return (
      <Box column pad>
        {input}
      </Box>
    );
  }
}

export default GroupManager;
