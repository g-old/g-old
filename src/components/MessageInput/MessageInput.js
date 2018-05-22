// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';

import Box from '../Box';
import FormField from '../FormField';
import Button from '../Button';
import FormValidation from '../FormValidation';
import Editor from '../MarkdownEditor';

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
    recipients: PropTypes.arrayOf(PropTypes.string),
    recipientType: PropTypes.oneOfType(['USER', 'GROUP']).isRequired,
  };

  static defaultProps = {
    notifyGroup: null,
    recipients: null,
  };
  constructor(props) {
    super(props);
    this.onNotify = this.onNotify.bind(this);
  }

  onNotify(values) {
    const subject = values.subject && values.subject.trim();
    const { recipients, recipientType } = this.props;
    this.props.notifyUser({
      message: JSON.stringify({
        recipientType,
        recipients,
        ...(!values.text.html.length && { message: values.text.rawInput }),
        messageHtml: values.text.html,
        subject,
      }),
    });
  }

  render() {
    const { updates = {}, recipients = [] } = this.props;

    return (
      <FormValidation
        updatePending={updates && updates.pending}
        validations={{ text: {}, subject: {}, recipients }}
        submit={this.onNotify}
      >
        {({ values, handleValueChanges, onSubmit, onBlur, errorMessages }) => (
          <Box column pad>
            <fieldset>
              {!recipients.length && (
                <FormField label="Receivers">
                  <input
                    name="receivers"
                    type="text"
                    onBlur={onBlur}
                    value={values.receivers}
                    onChange={handleValueChanges}
                  />
                </FormField>
              )}
              <FormField label="Subject" error={errorMessages.subjectError}>
                <input
                  name="subject"
                  type="text"
                  onBlur={onBlur}
                  value={values.subject}
                  onChange={handleValueChanges}
                />
              </FormField>
              <FormField label="Text" error={errorMessages.textError}>
                <Editor
                  value={values.text}
                  name="text"
                  onChange={handleValueChanges}
                />
                {/* <textarea
              name="messageText"
              onBlur={this.handleBlur}
              value={this.state.messageText}
              onChange={this.handleValueChange}
            /> */}
              </FormField>
            </fieldset>
            <Button
              fill
              primary
              onClick={onSubmit}
              pending={this.props.updates && this.props.updates.pending}
              label={<FormattedMessage {...messages.notify} />}
            />
          </Box>
        )}
      </FormValidation>
    );
  }
}

export default MessageInput;
