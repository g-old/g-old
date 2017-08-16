import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';

import Box from '../Box';
import FormField from '../FormField';
import Button from '../Button';
import CheckBox from '../CheckBox';
import { nameValidation, createValidator } from '../../core/validation';

const formFields = ['subject', 'notificationText'];
const messages = defineMessages({
  notify: {
    id: 'account.notify',
    defaultMessage: 'Notify user',
    description: 'Contact user',
  },

  empty: {
    id: 'form.error-empty',
    defaultMessage: "You can't leave this empty",
    description: 'Help for empty fields',
  },
});
class NotificationInput extends React.Component {
  static propTypes = {
    receiverId: PropTypes.string.isRequired,
    notifyUser: PropTypes.func.isRequired,
    updates: PropTypes.shape({ notification: PropTypes.shape({ pending: PropTypes.bool }) })
      .isRequired,
  };
  constructor(props) {
    super(props);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleValidation = this.handleValidation.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
    this.visibleErrors = this.visibleErrors.bind(this);
    this.onNotify = this.onNotify.bind(this);
    this.state = {
      errors: {
        subject: {
          touched: false,
        },
        notificationText: {
          touched: false,
        },
      },
    };

    const testValues = {
      subject: { fn: 'text' },
      notificationText: { fn: 'text' },
    };
    this.Validator = createValidator(
      testValues,
      {
        text: nameValidation,
      },
      this,
      obj => obj.state,
    );
  }
  onNotify() {
    if (this.handleValidation(formFields)) {
      const message = this.state.notificationText.trim();
      const subject = this.state.subject ? this.state.subject.trim() : null;
      const receiverId = this.props.receiverId;
      this.props.notifyUser({ message, subject, type: 'email', receiverId });
    }
  }
  handleValidation(fields) {
    const validated = this.Validator(fields);
    this.setState({ errors: { ...this.state.errors, ...validated.errors } });
    return validated.failed === 0;
  }
  handleValueChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }
  handleBlur(e) {
    const field = e.target.name;
    if (this.state[field]) {
      this.handleValidation([field]);
    }
  }

  visibleErrors(errorNames) {
    return errorNames.reduce((acc, curr) => {
      const err = `${curr}Error`;
      if (this.state.errors[curr].touched) {
        acc[err] = <FormattedMessage {...messages[this.state.errors[curr].errorName]} />;
      }
      return acc;
    }, {});
  }

  render() {
    const { subjectError, notificationTextError } = this.visibleErrors(formFields);

    return (
      <Box>
        <CheckBox checked label="Email" disabled />
        <fieldset>
          <FormField label="Subject" error={subjectError}>
            <input
              name="subject"
              type="text"
              onBlur={this.handleBlur}
              value={this.state.subject}
              onChange={this.handleValueChange}
            />
          </FormField>
          <FormField label="Text" error={notificationTextError}>
            <textarea
              name="notificationText"
              onBlur={this.handleBlur}
              value={this.state.notificationText}
              onChange={this.handleValueChange}
            />
          </FormField>
        </fieldset>
        <Button
          fill
          primary
          onClick={this.onNotify}
          pending={this.props.updates.notification && this.props.updates.notification.pending}
          label={<FormattedMessage {...messages.notify} />}
        />
      </Box>
    );
  }
}

export default NotificationInput;
