import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { defineMessages, FormattedMessage } from 'react-intl';
import cn from 'classnames';
import { validateEmail as checkEmail } from '../../core/helpers';
import { updateUser, fetchUser } from '../../actions/user';
import s from './UserProfile.css';
import { getSessionUser, getAccountUpdates } from '../../reducers';
import Avatar from '../Avatar';
import Icon from '../Icon';
import {
  createValidator,
  passwordValidation,
  passwordAgainValidation,
  emailValidation,
} from '../../core/validation';

const messages = defineMessages({
  empty: {
    id: 'signup.error-empty',
    defaultMessage: "You can't leave this empty",
    description: 'Help for empty fields',
  },
  shortPassword: {
    id: 'signup.error-shortPassword',
    defaultMessage: 'Short passwords are easy to guess. Try one with at least 6 characters ',
    description: 'Help for short passwords',
  },
  passwordMismatch: {
    id: 'signup.error-passwordMismatch',
    defaultMessage: "These passwords don't match. Try again?",
    description: 'Help for mismatching passwords',
  },

  invalidEmail: {
    id: 'signup.error-invalidEmail',
    defaultMessage: 'Your email address seems to be invalid',
    description: 'Help for email',
  },
  emailTaken: {
    id: 'signup.error-emailTaken',
    defaultMessage: 'Email address already in use',
    description: 'Help for not unique email',
  },
});

const renderFollowee = (data, fn) => /* eslint-disable jsx-a11y/no-static-element-interactions */
(
  <li
    style={{ display: 'inline' }}
    onClick={() => {
      fn({
        id: data.userId,
        followee: data.followee.id,
      });
    }}
  >
    <Avatar user={data.followee} isFollowee />
  </li>
);
/* eslint-enable jsx-a11y/no-static-element-interactions */

class UserProfile extends React.Component {
  static propTypes = {
    user: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      email: PropTypes.string,
      name: PropTypes.string,
      surname: PropTypes.string,
      avatar: PropTypes.string,
      followees: PropTypes.arrayOf(
        PropTypes.shape({
          avatar: PropTypes.isRequired,
        }),
      ),
    }).isRequired,
    updateUser: PropTypes.func.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    updates: PropTypes.object.isRequired,
    fetchUser: PropTypes.func.isRequired,
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  };
  constructor(props) {
    super(props);
    this.state = {
      password: '',
      passwordOld: '',
      passwordAgain: '',
      email: '',
      errors: {
        password: { touched: false },
        passwordAgain: { touched: false },
        passwordOld: { touched: false },
        email: { touched: false },
      },
      showEmailInput: false,
      invalidEmails: [],
    };
    this.onEditEmail = this.onEditEmail.bind(this);
    this.onPasswordChange = this.onPasswordChange.bind(this);
    this.onPasswordAgainChange = this.onPasswordAgainChange.bind(this);
    this.onPasswordOldChange = this.onPasswordOldChange.bind(this);
    this.onUpdatePassword = this.onUpdatePassword.bind(this);
    this.onUpdateEmail = this.onUpdateEmail.bind(this);
    this.onEmailChange = this.onEmailChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onPropertyBlur = this.onPropertyBlur.bind(this);
    const testValues = {
      passwordOld: { fn: 'password' },
      password: { fn: 'password' },
      passwordAgain: { fn: 'passwordAgain' },
      email: { fn: 'email' },
    };
    this.Validator = createValidator(
      testValues,
      {
        password: passwordValidation,
        passwordAgain: passwordAgainValidation,
        email: emailValidation,
      },
      {
        minPasswordLength: 6,
      },
      this,
    );
  }

  componentDidMount() {
    const { id } = this.props.user;
    this.props.fetchUser({ id });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.updates.email) {
      this.setState({ showEmailInput: false });
    }
    const { password } = nextProps.updates;
    if ((password && password.error) || (password && password.success)) {
      this.setState({ passwordOld: '', password: '', passwordAgain: '' });
    }
  }

  onEditEmail() {
    this.setState({ showEmailInput: !this.state.showEmailInput, email: this.props.user.email });
  }
  onUpdateEmail() {
    const newEmail = this.state.email.trim().toLowerCase();
    if (newEmail !== this.props.user.email.trim().toLowerCase()) {
      if (checkEmail(newEmail) && this.props.user.id) {
        alert(JSON.stringify(newEmail));
        this.props.updateUser({ id: this.props.user.id, email: newEmail });
      }
    }
  }
  onEmailChange(e) {
    this.setState({ email: e.target.value });
  }
  onUpdatePassword() {
    this.props.updateUser({});
  }
  onPasswordChange(e) {
    const password = e.target.value;
    if (this.state.errors.password.touched) {
      this.setState({
        errors: {
          ...this.state.errors,
          password: { ...this.state.errors.password, touched: false },
        },
      });
    }
    this.setState({ password });
  }
  onPasswordAgainChange(e) {
    const passwordAgain = e.target.value;
    if (this.state.errors.passwordAgain.touched) {
      this.setState({
        errors: {
          ...this.state.errors,
          passwordAgain: { ...this.state.errors.passwordAgain, touched: false },
        },
      });
    }
    this.setState({ passwordAgain });
  }
  onPropertyBlur(e) {
    const fields = [];
    const currentField = e.target.name;
    fields.push(e.target.name);
    if (currentField) {
      if (currentField === 'password' && this.state.passwordAgain.length > 0) {
        fields.push('passwordAgain');
      }
      const validated = this.Validator(fields);
      this.setState({ errors: { ...this.state.errors, ...validated.errors } });
    }
  }

  onPasswordOldChange(e) {
    const passwordOld = e.target.value;
    if (this.state.errors.passwordOld.touched) {
      this.setState({
        errors: {
          ...this.state.errors,
          passwordOld: { ...this.state.errors.passwordOld, touched: false },
        },
      });
    }
    this.setState({ passwordOld });
  }
  onSubmit() {
    const validated = this.Validator(['passwordOld', 'password', 'passwordAgain']);
    this.setState({ errors: { ...this.state.errors, ...validated.errors } });
    if (!validated.failed) {
      alert(JSON.stringify(validated));
      this.props.updateUser({
        id: this.props.user.id,
        passwordOld: this.state.passwordOld.trim(),
        password: this.state.password.trim(),
      });
    } else {
      console.log('Validation failed');
    }
  }

  render() {
    if (!this.props.user) return null;
    const updates = this.props.updates;
    // const showEmail = !updates.email.pending || updates.email.success || updates.email.error;

    const { avatar, name, surname, email, followees } = this.props.user;
    const emailField = this.state.showEmailInput
      ? (<input
        type="text"
        onChange={this.onEmailChange}
        value={this.state.email}
        name="email"
        onBlur={this.onPropertyBlur}
      />)
      : email;

    const updateEmailBtn = this.state.showEmailInput
      ? (<button onClick={this.onUpdateEmail} disabled={updates.email && updates.email.pending}>
          UPDATE
        </button>)
      : null;

    const { password } = this.props.updates;
    return (
      <div className={s.root}>
        <div className={s.container}>
          <img className={s.avatar} src={avatar} alt="IMG" />
          <div>
            <h3>{name}</h3>
            <h3>{surname}</h3>
            <h3>{'Some Data'}</h3>
            <div>
              <Icon
                icon={
                  'M24 24.082v-1.649c2.203-1.241 4-4.337 4-7.432 0-4.971 0-9-6-9s-6 4.029-6 9c0 3.096 1.797 6.191 4 7.432v1.649c-6.784 0.555-12 3.888-12 7.918h28c0-4.030-5.216-7.364-12-7.918z M10.225 24.854c1.728-1.13 3.877-1.989 6.243-2.513-0.47-0.556-0.897-1.176-1.265-1.844-0.95-1.726-1.453-3.627-1.453-5.497 0-2.689 0-5.228 0.956-7.305 0.928-2.016 2.598-3.265 4.976-3.734-0.529-2.39-1.936-3.961-5.682-3.961-6 0-6 4.029-6 9 0 3.096 1.797 6.191 4 7.432v1.649c-6.784 0.555-12 3.888-12 7.918h8.719c0.454-0.403 0.956-0.787 1.506-1.146z'
                }
              />
              <h3>Followees </h3>

              <p>
                {/* eslint-disable jsx-a11y/no-static-element-interactions */}
                {followees &&
                  <ul style={{ listStyle: 'none' }}>
                    {followees.map(f =>
                      renderFollowee(
                        { userId: this.props.user.id, followee: f },
                        this.props.updateUser,
                      ),
                    )}
                  </ul>}
                {/* eslint-enable jsx-a11y/no-static-element-interactions */}

              </p>
            </div>
          </div>
          <div>
            <h3> Settings</h3>
            <div>
              {updates &&
                updates.email &&
                updates.email.error &&
                <div className={s.error}> {'An error occured'}</div>}
              <span>
                {emailField}
                {updateEmailBtn}
                <button onClick={this.onEditEmail}>
                  {this.state.showEmailInput ? 'CANCEL' : 'CHANGE'}
                </button>
              </span>
              <div>
                {this.state.errors.email.touched
                  ? <FormattedMessage {...messages[this.state.errors.email.errorName]} />
                  : ''}
              </div>
            </div>
            <div>
              <h4> {'Password ändern'} </h4>
              <div className={s.formGroup}>
                <label htmlFor="passwordOld" className={s.label}>
                  Your current password
                </label>
                <input
                  className={cn(s.input, this.state.errors.passwordOld.touched && s.error)}
                  name="passwordOld"
                  type="password"
                  onChange={this.onPasswordOldChange}
                  value={this.state.passwordOld}
                  onBlur={this.onPropertyBlur}
                  placeholder={'enter your current password'}
                />
                <div>
                  {this.state.errors.passwordOld.touched
                    ? <FormattedMessage {...messages[this.state.errors.passwordOld.errorName]} />
                    : ''}
                </div>
              </div>

              <div className={s.formGroup}>
                <label htmlFor="password" className={s.label}>
                  New Password
                </label>
                <input
                  className={cn(s.input, this.state.errors.password.touched && s.error)}
                  name="password"
                  type="password"
                  onChange={this.onPasswordChange}
                  value={this.state.password}
                  onBlur={this.onPropertyBlur}
                  placeholder={'enter a new password'}
                />
                <div>
                  {this.state.errors.password.touched
                    ? <FormattedMessage {...messages[this.state.errors.password.errorName]} />
                    : ''}
                </div>
              </div>
              <div className={s.formGroup}>
                <label htmlFor="passwordAgain" className={s.label}>
                  Confirm new Password
                </label>
                <input
                  className={cn(s.input, this.state.errors.passwordAgain.touched && s.error)}
                  name="passwordAgain"
                  type="password"
                  onChange={this.onPasswordAgainChange}
                  value={this.state.passwordAgain}
                  onBlur={this.onPropertyBlur}
                  placeholder={'enter the password again'}
                />
                <div>
                  {this.state.errors.passwordAgain.touched
                    ? <FormattedMessage {...messages[this.state.errors.passwordAgain.errorName]} />
                    : ''}
                </div>
              </div>
              <div className={s.formGroup}>
                <button
                  className={s.button}
                  onClick={this.onSubmit}
                  disabled={password && password.pending}
                >
                  Update Password
                </button>
              </div>
              {password && password.error && <div>Something bad happened</div>}
              {password && password.success && 'PASSWORD SET'}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
const mapDispatch = {
  updateUser,
  fetchUser,
};
const mapStateToProps = (state, { user }) => ({
  user: getSessionUser(state),
  updates: getAccountUpdates(state, user.id),
});

export default connect(mapStateToProps, mapDispatch)(withStyles(s)(UserProfile));
