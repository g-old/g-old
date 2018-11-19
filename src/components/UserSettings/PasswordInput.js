import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages } from 'react-intl';
import {
  passwordValidation,
  passwordAgainValidation,
} from '../../core/validation';
import FormField from '../FormField';
import Box from '../Box';
import Button from '../Button';
import FormValidation from '../FormValidation';
import Notification from '../Notification';

const messages = defineMessages({
  currentPassword: {
    id: 'userSettings.oldPW',
    defaultMessage: 'Enter your current password ',
    description: 'Current account password for form label',
  },
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

  success: {
    id: 'action.success',
    defaultMessage: 'Success!',
    description: 'Short success notification ',
  },

  change: {
    id: 'commands.change',
    defaultMessage: 'Change',
    description: 'Short command to change a setting',
  },
});

class PasswordInput extends React.Component {
  static propTypes = {
    updates: PropTypes.shape({}),
    user: PropTypes.shape({}).isRequired,
    onUpdate: PropTypes.func.isRequired,
    invalidPassword: PropTypes.string,
  };

  static defaultProps = {
    updates: null,
    invalidPassword: null,
  };

  constructor(props) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
    this.handleInvalidPassword = this.handleInvalidPassword.bind(this);
    this.state = { invalidPasswords: [] };
    this.form = React.createRef();
  }

  componentDidUpdate(prevProps) {
    const { invalidPassword } = this.props;
    if (invalidPassword && !prevProps.invalidPassword) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState(
        prevState => ({
          invalidPasswords: [
            ...prevState.invalidPasswords,
            prevState.validated.currentPassword.trim(),
          ],
        }),
        this.handleInvalidPassword,
      );
    }
  }

  onSubmit(values) {
    const { onUpdate, user } = this.props;
    onUpdate({
      id: user.id,
      passwordOld: values.currentPassword.trim(),
      password: values.password.trim(),
    });
    this.setState({ validated: values });
  }

  handleInvalidPassword() {
    const { invalidPasswords } = this.state;
    this.form.current.enforceValidation(['currentPassword'], {
      invalidPasswords,
    });
  }

  render() {
    const { updates, user } = this.props;
    const { invalidPasswords } = this.state;
    return (
      <FormValidation
        ref={this.form}
        key={
          user.id // eslint-disable-line
        }
        options={{ invalidPasswords }}
        validations={{
          currentPassword: {
            fn: passwordValidation,
            args: { required: true, min: 6 },
          },
          password: {
            fn: passwordValidation,
            args: { required: true, min: 6 },
          },
          passwordAgain: {
            fn: passwordAgainValidation,
            args: { required: true, min: 6 },
          },
        }}
        submit={this.onSubmit}
      >
        {({
          errorMessages,
          handleValueChanges,
          values,
          onSubmit,
          inputChanged,
        }) => (
          <React.Fragment>
            {updates.error && (
              <Notification type="error" message={updates.error} />
            )}
            <fieldset>
              <FormField
                label={<FormattedMessage {...messages.currentPassword} />}
                error={errorMessages.currentPasswordError}
              >
                <input
                  name="currentPassword"
                  type="password"
                  onChange={handleValueChanges}
                  value={values.currentPassword}
                />
              </FormField>
              <FormField
                label={<FormattedMessage {...messages.password} />}
                error={errorMessages.passwordError}
              >
                <input
                  name="password"
                  type="password"
                  onChange={handleValueChanges}
                  value={values.password}
                />
              </FormField>
              <FormField
                label={<FormattedMessage {...messages.passwordAgain} />}
                error={errorMessages.passwordAgainError}
              >
                <input
                  name="passwordAgain"
                  type="password"
                  onChange={handleValueChanges}
                  value={values.passwordAgain}
                />
              </FormField>
              {updates.success && (
                <Notification
                  type="success"
                  message={<FormattedMessage {...messages.success} />}
                />
              )}
            </fieldset>
            <Box justify>
              {inputChanged && (
                <Button
                  primary
                  disabled={updates.pending}
                  onClick={onSubmit}
                  label={<FormattedMessage {...messages.change} />}
                />
              )}
            </Box>
          </React.Fragment>
        )}
      </FormValidation>
    );
  }
}

export default PasswordInput;
