import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';

import Box from '../Box';
import FormField from '../FormField';
import Button from '../Button';
import { nameValidation, createValidator } from '../../core/validation';

const formFields = ['subject', 'messageText'];
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
class MessageInput extends React.Component {
  static propTypes = {
    receiverId: PropTypes.string.isRequired,
    notifyUser: PropTypes.func.isRequired,
    updates: PropTypes.shape({
      pending: PropTypes.bool,
    }).isRequired,
    notifyGroup: PropTypes.bool,
  };

  static defaultProps = {
    notifyGroup: null,
  };
  constructor(props) {
    super(props);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleValidation = this.handleValidation.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
    this.visibleErrors = this.visibleErrors.bind(this);
    this.onNotify = this.onNotify.bind(this);
    this.state = {
      subject: '',
      messageText: '',
      errors: {
        subject: {
          touched: false,
        },
        messageText: {
          touched: false,
        },
      },
    };

    const testValues = {
      subject: { fn: 'text' },
      messageText: { fn: 'text' },
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

  componentWillReceiveProps({ updates }) {
    if (updates && updates.success) {
      this.setState({ subject: '', messageText: '' });
    }
  }

  onNotify() {
    if (this.handleValidation(formFields)) {
      const message = this.state.messageText.trim();
      const subject = this.state.subject ? this.state.subject.trim() : null;
      const { receiverId } = this.props;
      this.props.notifyUser({
        message: JSON.stringify({
          messageType: 'msg',
          msg: message,
          title: subject,
        }),
        subject,
        type: 'message',
        receiverId,
        receiver: {
          type: this.props.notifyGroup ? 'team' : 'user',
          id: receiverId,
        },
      });
    }
  }
  handleValidation(fields) {
    const validated = this.Validator(fields);
    this.setState({ errors: { ...this.state.errors, ...validated.errors } });
    return validated.failed === 0;
  }
  handleValueChange(e) {
    let newState;
    switch (e.target.name) {
      case 'event':
      case 'subject':
      case 'messageText': {
        newState = { [e.target.name]: e.target.value };
        break;
      }

      default: {
        newState = undefined;
      }
    }
    this.setState(newState);
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
        acc[err] = (
          <FormattedMessage {...messages[this.state.errors[curr].errorName]} />
        );
      }
      return acc;
    }, {});
  }

  render() {
    const { subjectError, messageTextError } = this.visibleErrors(formFields);
    return (
      <Box column pad>
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
          <FormField label="Text" error={messageTextError}>
            <textarea
              name="messageText"
              onBlur={this.handleBlur}
              value={this.state.messageText}
              onChange={this.handleValueChange}
            />
          </FormField>
        </fieldset>
        <Button
          fill
          primary
          onClick={this.onNotify}
          pending={this.props.updates && this.props.updates.pending}
          label={<FormattedMessage {...messages.notify} />}
        />
      </Box>
    );
  }
}

export default MessageInput;
