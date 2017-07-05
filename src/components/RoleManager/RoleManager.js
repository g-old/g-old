import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';
import CheckBox from '../CheckBox';
import Box from '../Box';
import Button from '../Button';
import FormField from '../FormField';

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
    accountRole: PropTypes.string.isRequired,
    accountId: PropTypes.string.isRequired,
    updateFn: PropTypes.func.isRequired,
    updates: PropTypes.shape({ error: PropTypes.bool, pending: PropTypes.bool }),
  };
  static defaultProps = {
    updates: {},
  };

  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.availableRoles = roles.slice(roles.indexOf(props.userRole) + 1);
    this.state = calcState(this.availableRoles, props.accountRole);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.updates && nextProps.updates.error) {
      const old = this.props.updates || {};
      this.setState({ error: !old.error });
    }
    if (nextProps !== this.props) {
      this.availableRoles = roles.slice(roles.indexOf(nextProps.userRole) + 1);
      const newState = calcState(this.availableRoles, nextProps.accountRole);
      this.setState(newState);
    }
  }

  onChange(e) {
    if (e.target.name !== this.props.accountRole) {
      this.props.updateFn({ id: this.props.accountId, role: e.target.name });
    }
  }

  availableRoles = [];
  render() {
    let promoteButton = null;
    const { userRole, updates } = this.props;
    if (!['admin', 'mod'].includes(userRole)) {
      promoteButton = (
        <Button
          label={<FormattedMessage {...messages.unlockViewer} />}
          onClick={() => this.props.updateFn({ id: this.props.accountId, role: 'viewer' })}
        />
      );
    }

    const error = this.state.error && <FormattedMessage {...messages.error} />;
    return (
      <Box column pad>
        {promoteButton}
        <FormField label={<FormattedMessage {...messages.header} />} error={error}>
          {!promoteButton &&
            this.availableRoles.map(r =>
              (<CheckBox
                label={r}
                disabled={updates && updates.pending}
                checked={this.state[r]}
                onChange={this.onChange}
                name={r}
              />),
            )}
        </FormField>

      </Box>
    );
  }
}

export default RoleManager;
