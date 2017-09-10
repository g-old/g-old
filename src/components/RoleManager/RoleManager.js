import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';
import CheckBox from '../CheckBox';
import Box from '../Box';
import Button from '../Button';
import FormField from '../FormField';
import { PRIVILEGES } from '../../constants';

const roles = ['admin', 'mod', 'user', 'viewer', 'guest'];

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
    account: PropTypes.shape({
      role: PropTypes.shape({
        type: PropTypes.string,
      }),
      id: PropTypes.string,
    }).isRequired,
    user: PropTypes.shape({
      role: PropTypes.shape({
        type: PropTypes.string,
      }),
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
    this.availableRoles = roles.slice(roles.indexOf(props.userRole) + 1);
    this.state = calcState(this.availableRoles, props.account.role.type);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.updates && nextProps.updates.error) {
      const old = this.props.updates || {};
      this.setState({ error: !old.error });
    }
    if (nextProps !== this.props) {
      this.availableRoles = roles.slice(roles.indexOf(nextProps.userRole) + 1);
      const newState = calcState(
        this.availableRoles,
        nextProps.account.role.type,
      );
      this.setState(newState);
    }
  }

  onChange(e) {
    const {
      user,
      account: { role, id, emailVerified, workTeams, avatar },
    } = this.props;
    // TODO VALIDATION FN
    if (e.target.name !== role.type) {
      // dont allow change from guest if no profile, no workteam and no email verification
      if (
        user.role.type === 'admin' ||
        (emailVerified && avatar && workTeams && workTeams.length)
      ) {
        this.props.updateFn({ id, role: e.target.name });
      }
    }
  }

  availableRoles = [];
  render() {
    let promoteButton = null;
    const { user, updates, account } = this.props;
    if (
      !['admin', 'mod'].includes(user.role.type) ||
      (!user.privilege & PRIVILEGES.canUnlockUser && // eslint-disable-line no-bitwise
        account.role.type === 'guest')
    ) {
      promoteButton = (
        <Button
          primary
          label={<FormattedMessage {...messages.unlock} />}
          onClick={() => this.onChange({ target: { name: 'viewer' } })}
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
            this.availableRoles.map(r =>
              <CheckBox
                label={r}
                disabled={updates && updates.pending}
                checked={this.state[r]}
                onChange={this.onChange}
                name={r}
              />,
            )}
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

export default RoleManager;
