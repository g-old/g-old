import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { defineMessages, FormattedMessage } from 'react-intl';
import s from './PasswordRecovery.css';
import { recoverPassword } from '../../actions/password_reset';

const messages = defineMessages({
  email: {
    id: 'login.email',
    defaultMessage: 'Email',
    description: 'Email-address',
  },
  reset: {
    id: 'passwordRecovery.reset',
    defaultMessage: 'Reset Password',
    description: 'Reset Password',
  },
  stepOne: {
    id: 'passwordRecovery.stepOne',
    defaultMessage: "Enter your email address below and we'll send you a link to reset your password",
    description: 'Password recovery instruction',
  },
  stepTwo: {
    id: 'passwordRecovery.stepTwo',
    defaultMessage: "Check your inbox for the next steps. If you don't receive an email, and it's not in your spam folder this could mean you signed up with a different address.",
    description: 'Password recovery instruction',
  },
});

class PasswordRecovery extends React.Component {
  static propTypes = {
    recoverPassword: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = { email: '' };
    this.onEmailChange = this.onEmailChange.bind(this);
  }
  onEmailChange(e) {
    const email = e.target.value;
    this.setState({ email });
  }
  render() {
    let help = null;
    if (this.state.sent) {
      help = <div><FormattedMessage {...messages.stepTwo} /></div>;
    } else {
      help = (
        <div>
          <FormattedMessage {...messages.stepOne} />
          <br />
          <div className={s.formGroup}>
            <label className={s.label} htmlFor="email">
              <FormattedMessage {...messages.email} />:
            </label>
            <input
              className={s.input}
              value={this.state.email}
              onChange={this.onEmailChange}
              id="email"
              type="text"
              name="email"
              autoFocus
            />
          </div>
          <div className={s.formGroup}>
            <button
              className={s.button}
              onClick={() => {
                this.props.recoverPassword({ email: this.state.email });
                this.setState({ sent: true });
              }}
            >
              <FormattedMessage {...messages.reset} />
            </button>
          </div>
        </div>
      );
    }
    return (
      <div className={s.root}>
        <div className={s.container}>
          <h1> Reset Password</h1>
          {help}
        </div>
      </div>
    );
  }
}

const mapDispatch = {
  recoverPassword,
};

export default connect(null, mapDispatch)(withStyles(s)(PasswordRecovery));
