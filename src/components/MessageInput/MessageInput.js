// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';

import Box from '../Box';
import FormField from '../FormField';
import Button from '../Button';
import FormValidation from '../FormValidation';
import Tabs from '../Tabs';
import Tab from '../Tab';
import InputMask from './InputMask';

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
    messageType: PropTypes.oneOfType(['COMMUNICATION', 'NOTE']).isRequired,
    parentId: PropTypes.string,
  };

  static defaultProps = {
    notifyGroup: null,
    recipients: null,
    parentId: null,
  };
  constructor(props) {
    super(props);
    this.onNotify = this.onNotify.bind(this);
    this.state = { data: {} };
  }

  componentWillReceiveProps({ updates }) {
    if (updates && updates.success) {
      this.setState({
        data: {
          textDe: { rawInput: '', html: '' },
          textIt: { rawInput: '', html: '' },
          subjectDe: '',
          subjectIT: '',
          recipients: [],
        },
      });
    }
  }

  onNotify(values) {
    const subject = { de: values.subjectDe, it: values.subjectIt };
    const { recipients, recipientType, messageType, parentId } = this.props;

    const object = {};
    if (messageType === 'NOTE') {
      object.note = {
        textHtml: {
          de: values.textDe.html,
          it: values.textIt.html,
        },
        category: 'CIRCULAR',
      };
    } else if (messageType === 'COMMUNICATION') {
      object.communication = {
        parentId,
        textHtml: values.textDe.html,
        replyable: true,
      };
    }
    this.props.notifyUser({
      recipientType,
      messageType,
      ...object,
      recipients,
      subject,
    });
  }

  render() {
    const { updates = {}, recipients = [], messageType } = this.props;

    return (
      <FormValidation
        updatePending={updates && updates.pending}
        validations={{
          textDe: {},
          textIt: {},
          subjectDe: {},
          subjectIt: {},
          recipients: {},
        }}
        submit={this.onNotify}
        data={this.state.data}
      >
        {({ values, handleValueChanges, onSubmit, onBlur, errorMessages }) => (
          <Box column>
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
              {messageType === 'COMMUNICATION' && (
                <InputMask
                  locale="De"
                  values={values}
                  handleValueChanges={handleValueChanges}
                  errors={errorMessages}
                />
              )}
              {messageType === 'NOTE' && (
                <Tabs>
                  <Tab title="Deutsch">
                    <InputMask
                      locale="De"
                      values={values}
                      handleValueChanges={handleValueChanges}
                      errors={errorMessages}
                    />
                  </Tab>
                  <Tab title="Italiano">
                    <InputMask
                      locale="It"
                      values={values}
                      handleValueChanges={handleValueChanges}
                      errors={errorMessages}
                    />
                  </Tab>
                </Tabs>
              )}
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
