/* eslint-disable */
import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';
import Box from '../Box';
import Button from '../Button';
import FormField from '../FormField';
import Notification from '../Notification';
import Select from '../Select';
import {
  createValidator,
  passwordValidation,
  passwordAgainValidation,
  emailValidation,
  nameValidation,
  capitalizeFirstLetter,
} from '../../core/validation';

const messages = defineMessages({
  invalidEmail: {
    id: 'form.error-invalidEmail',
    defaultMessage: 'Your email address seems to be invalid',
    description: 'Help for email',
  },
  emailTaken: {
    id: 'form.error-emailTaken',
    defaultMessage: 'Email address already in use',
    description: 'Help for not unique email',
  },
  change: {
    id: 'commands.change',
    defaultMessage: 'Change',
    description: 'Short command to change a setting',
  },
  cancel: {
    id: 'commands.cancel',
    defaultMessage: 'Cancel',
    description: 'Short command to cancel a operation',
  },
  email: {
    id: 'settings.email',
    defaultMessage: 'Your current email address',
    description: 'Email label in settings',
  },
  emailNew: {
    id: 'settings.emailNew',
    defaultMessage: 'New email address',
    description: 'Email label in settings for new address',
  },

  success: {
    id: 'action.success',
    defaultMessage: 'Success!',
    description: 'Short success notification ',
  },
  error: {
    id: 'action.error',
    defaultMessage: 'Action failed. Please retry!',
    description: 'Short failure notification ',
  },
  verified: {
    id: 'settings.email.verified',
    defaultMessage: 'Email verified!',
    description: 'Email got verified ',
  },
  notVerified: {
    id: 'settings.email.notVerified',
    defaultMessage: 'Email not verified',
    description: 'Email not yet verified ',
  },
  resend: {
    id: 'settings.email.resend',
    defaultMessage: 'Resend verification email',
    description: 'Resend verification email ',
  },
});

const initState = {
  email: '',
  errors: {
    email: { touched: false },
  },
};

const EmailInput = ({
  error,
  emailStatus,
  handleChange,
  value,
  showEmailField,
}) => {
  return (
    <fieldset>
      {error && (
        <div style={{ backgroundColor: 'rgba(255, 50, 77, 0.3)' }}>
          <FormattedMessage {...messages.error} />
        </div>
      )}
      <FormField
        label={
          <FormattedMessage
            {...messages[showEmailField ? 'emailNew' : 'email']}
          />
        }
        error={error}
        help={emailStatus}
      >
        <input
          type="text"
          onChange={handleChange}
          value={value}
          name="email"
          readOnly={showEmailField === false}
        />
      </FormField>
    </fieldset>
  );
};

export default EmailInput;
