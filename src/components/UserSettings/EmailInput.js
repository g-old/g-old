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

  error: {
    id: 'action.error',
    defaultMessage: 'Action failed. Please retry!',
    description: 'Short failure notification ',
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
