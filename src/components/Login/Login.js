import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { defineMessages, FormattedMessage } from 'react-intl';
import s from './Login.css';

const messages = defineMessages({
  email: {
    id: 'login.email',
    defaultMessage: 'Email',
    description: 'Email-address',
  },
  password: {
    id: 'login.password',
    defaultMessage: 'Password',
    description: 'Password',
  },
});

class Login extends React.Component {

  render() {
    return (
      <div className={s.root}>
        <div className={s.container}>
          <form method="post">
            <div className={s.formGroup}>
              <label className={s.label} htmlFor="usernameOrEmail">
                <FormattedMessage {...messages.email} />:
              </label>
              <input
                className={s.input}
                id="usernameOrEmail"
                type="text"
                name="usernameOrEmail"
                autoFocus
              />
            </div>
            <div className={s.formGroup}>
              <label className={s.label} htmlFor="password">
                <FormattedMessage {...messages.password} />:
              </label>
              <input
                className={s.input}
                id="password"
                type="password"
                name="password"
              />
            </div>
            <div className={s.formGroup}>
              <button className={s.button} type="submit">
                Log in
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default withStyles(s)(Login);
