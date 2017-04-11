import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { defineMessages, FormattedMessage } from 'react-intl';
import cn from 'classnames';
import s from './PasswordReset.css';
import { resetPassword } from '../../actions/password_reset';

const messages = defineMessages({
  password: {
    id: 'signup.password',
    defaultMessage: 'Create a password',
    description: 'Password',
  },
  passwordAgain: {
    id: 'signup.passwordAgain',
    defaultMessage: 'Confirm your password',
    description: 'PasswordAgain',
  },
  reset: {
    id: 'passwordRecovery.reset',
    defaultMessage: 'Reset Password',
    description: 'Reset Password',
  },
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
});

class PasswordReset extends React.Component {
  static propTypes = {
    resetPassword: PropTypes.func.isRequired,
    token: PropTypes.string.isRequired,
    error: PropTypes.bool,
    success: PropTypes.bool,
  };
  constructor(props) {
    super(props);
    this.state = {
      password: '',
      passwordAgain: '',
      errors: {
        password: {
          touched: false,
        },
        passwordAgain: {
          touched: false,
        },
      },
    };
    this.onPasswordChange = ::this.onPasswordChange;
    this.onPasswordAgainChange = ::this.onPasswordAgainChange;
    this.validatePassword = ::this.validatePassword;
    this.validatePasswordAgain = ::this.validatePasswordAgain;
    this.onPasswordBlur = ::this.onPasswordBlur;
    this.onPasswordAgainBlur = ::this.onPasswordAgainBlur;
    this.onSubmit = ::this.onSubmit;
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
  onPasswordBlur() {
    const password = this.validatePassword(6);
    let passwordAgain = { touched: false };
    if (this.state.passwordAgain.length > 0) {
      passwordAgain = this.validatePasswordAgain();
    }

    this.setState({ errors: { ...this.state.errors, password, passwordAgain } });
  }
  onPasswordAgainBlur() {
    const passwordAgain = this.validatePasswordAgain();
    this.setState({ errors: { ...this.state.errors, passwordAgain } });
  }
  onSubmit() {
    const valid = this.validateForm();
    if (valid) {
      let { password } = this.state;

      password = password.trim();
      const data = {
        password,
        token: this.props.token,
      };
      //  alert(JSON.stringify(data));
      this.props.resetPassword(data);
    } else {
      // alert('FORM not valid');
    }
  }
  validatePassword(minPasswordLength) {
    let password = this.state.password;
    password = password.trim();
    let result = {
      touched: false,
    };
    if (!password) {
      result = {
        touched: true,
        errorName: 'empty',
      };
    } else if (password.length < minPasswordLength) {
      result = {
        touched: true,
        errorName: 'shortPassword',
      };
    }
    return result;
  }
  validatePasswordAgain() {
    let passwordAgain = this.state.passwordAgain;
    passwordAgain = passwordAgain.trim();
    let result = {
      touched: false,
    };
    if (!passwordAgain) {
      result = {
        touched: true,
        errorName: 'empty',
      };
    } else if (this.state.password.trim() !== passwordAgain) {
      result = {
        touched: true,
        errorName: 'passwordMismatch',
      };
    }
    return result;
  }
  validateForm() {
    // validate each field
    let errors = {};
    let error = false;

    const password = this.validatePassword(6);
    if (password.touched) {
      error = true;
    }

    const passwordAgain = this.validatePasswordAgain();
    if (passwordAgain.touched) {
      error = true;
    }

    // if errors, set state, else submit
    if (error) {
      errors = {
        password,
        passwordAgain,
      };
      this.setState({ errors });
    }
    return error === false;
  }

  render() {
    let content;
    if (this.props.success) {
      content = <div> YOU ARE LOGGED IN!</div>;
    } else {
      content = (
        <div>
          <h1> Reset Password</h1>
          <div className={s.formGroup}>
            <label className={s.label} htmlFor="password">
              <FormattedMessage {...messages.password} />
            </label>
            <input
              className={cn(s.input, this.state.errors.password.touched && s.error)}
              id="password"
              type="password"
              name="password"
              value={this.state.password}
              onChange={this.onPasswordChange}
              onBlur={this.onPasswordBlur}
            />
            <div>
              {this.state.errors.password.touched
                ? <FormattedMessage {...messages[this.state.errors.password.errorName]} />
                : ''}
            </div>
          </div>
          <div className={s.formGroup}>
            <label className={s.label} htmlFor="passwordAgain">
              <FormattedMessage {...messages.passwordAgain} />
            </label>
            <input
              className={cn(s.input, this.state.errors.passwordAgain.touched && s.error)}
              id="passwordAgain"
              type="password"
              name="passwordAgain"
              value={this.state.passwordAgain}
              onChange={this.onPasswordAgainChange}
              onBlur={this.onPasswordAgainBlur}
            />
            <div>
              {this.state.errors.passwordAgain.touched
                ? <FormattedMessage {...messages[this.state.errors.passwordAgain.errorName]} />
                : ''}
            </div>
          </div>
          <div className={s.formGroup}>
            <button className={s.button} onClick={this.onSubmit}>
              <FormattedMessage {...messages.reset} />
            </button>
          </div>
        </div>
      );
    }
    return (
      <div className={s.root}>
        <div className={s.container}>
          {this.props.error && <div className={s.error}> <h3>SOMETHING WENT WRONG</h3> </div>}
          {content}
        </div>
      </div>
    );
  }
}

const mapDispatch = {
  resetPassword,
};
const mapStateToProps = state => ({
  error: state.ui.resetError || null,
  success: state.ui.resetSuccess || null,
});

export default connect(mapStateToProps, mapDispatch)(withStyles(s)(PasswordReset));
