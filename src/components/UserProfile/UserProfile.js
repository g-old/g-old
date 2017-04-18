import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { defineMessages, FormattedMessage } from 'react-intl';
import cn from 'classnames';
import { validateEmail as checkEmail } from '../../core/helpers';
import { updateUser } from '../../actions/user';
import s from './UserProfile.css';
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

class UserProfile extends React.Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    updateUser: PropTypes.func.isRequired,
    updates: PropTypes.object,
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
    this.onEditEmail = ::this.onEditEmail;
    this.onPasswordChange = ::this.onPasswordChange;
    this.onPasswordAgainChange = ::this.onPasswordAgainChange;
    this.onPasswordOldChange = ::this.onPasswordOldChange;
    this.onUpdatePassword = ::this.onUpdatePassword;
    this.onUpdateEmail = ::this.onUpdateEmail;
    this.onEmailChange = ::this.onEmailChange;
    this.onSubmit = ::this.onSubmit;
    this.onPropertyBlur = ::this.onPropertyBlur;
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

  componentWillReceiveProps(nextProps) {
    if (nextProps.updates.email) {
      this.setState({ showEmailInput: false });
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
    const updates = this.props.updates;
    // const showEmail = !updates.email.pending || updates.email.success || updates.email.error;

    const { avatar, name, surname, email } = this.props.user;
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
    return (
      <div className={s.root}>
        <div className={s.container}>
          <img
            className={s.avatar}
            src={avatar}
            alt="IMG"
          />
          <div>
            <h3>{name}</h3>
            <h3>{surname}</h3>
            <h3>{'Some Data'}</h3>
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
                  disabled={updates.password && updates.password.pending}
                >
                  Update Password
                </button>
              </div>
              {updates &&
                updates.password &&
                updates.password.error &&
                <div>Something bad happened</div>}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
const mapDispatch = {
  updateUser,
};
const mapStateToProps = state => {
  const updates = state.ui.updates ? state.ui.updates[state.user] || {} : {};
  const user = state.entities.users[state.user];
  return {
    updates,
    user,
  };
};

export default connect(mapStateToProps, mapDispatch)(withStyles(s)(UserProfile));
