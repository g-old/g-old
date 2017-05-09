import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './RoleManager.css';
import CheckBox from '../CheckBox';

const roles = ['admin', 'mod', 'user', 'viewer', 'guest'];

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
        <button onClick={() => this.props.updateFn({ id: this.props.accountId, role: 'viewer' })}>
          {'Unlock status viewer'}
        </button>
      );
    }
    return (
      <div>
        <h3> {'Set Roles'}</h3>
        {promoteButton}

        {!promoteButton &&
          <div>
            {this.availableRoles.map(r => (
              <div className={s.box}>
                <CheckBox
                  label={<label htmlFor={r}> {r}</label>}
                  checked={this.state[r]}
                  onChange={this.onChange}
                  name={r}
                />
              </div>
            ))}
            <button onClick={this.onSubmit}>{'CHANGE ROLE'}</button>
          </div>}

      </div>
    );
  }
}

export default withStyles(s)(RoleManager);
