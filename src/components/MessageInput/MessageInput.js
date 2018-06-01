// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';

import Box from '../Box';
import CheckBox from '../CheckBox';
import FormField from '../FormField';
import Button from '../Button';
import FormValidation from '../FormValidation';
import InputMask from './InputMask';
import LocaleSelector from './LocaleSelector';
import Select from '../Select';

const messages = defineMessages({
  send: {
    id: 'command.submit',
    description: 'Short command for sending data to the server',
    defaultMessage: 'Submit',
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
    this.state = {
      data: {
        textde: { rawInput: '', html: '' },
        textit: { rawInput: '', html: '' },
        subjectde: '',
        subjectit: '',
        recipients: [],
      },
      activeLocale: 'de',
    };
    this.handleLanguageSelection = this.handleLanguageSelection.bind(this);
  }

  componentWillReceiveProps({ updates }) {
    if (updates && updates.success) {
      this.setState({
        data: {
          textde: { rawInput: '', html: '' },
          textit: { rawInput: '', html: '' },
          subjectde: '',
          subjectit: '',
          recipients: [],
          enforceEmail: false,
        },
      });
    }
  }

  onNotify(values) {
    const subject = { de: values.subjectde, it: values.subjectit };
    const {
      recipients = [],
      recipientType,
      messageType,
      parentId,
    } = this.props;

    const object = {};
    if (messageType === 'NOTE') {
      object.note = {
        textHtml: {
          ...(values.textde && { de: values.textde.html }),
          ...(values.textit && { it: values.textit.html }),
        },
        category: 'CIRCULAR',
      };
    } else if (messageType === 'COMMUNICATION') {
      object.communication = {
        textHtml: values.textde.html,
        replyable: true,
      };
    }
    this.props.notifyUser({
      parentId,
      recipientType:
        (values.recipientType && values.recipientType.value) || recipientType,
      messageType,
      ...object,
      recipients: recipients || [],
      subject,
      enforceEmail: values.enforceEmail,
    });
  }

  handleLanguageSelection(locale) {
    this.setState({ activeLocale: locale });
  }

  render() {
    const { updates = {}, messageType, recipientType } = this.props;
    const { activeLocale } = this.state;
    return (
      <FormValidation
        updatePending={updates && updates.pending}
        validations={{
          textit: {},
          textde: {},
          subjectde: {},
          subjectit: {},
          recipients: {},
          recipientType: {
            /*  ...(!recipientType && { args: { required: true } }), */
          },
          enforceEmail: {},
        }}
        submit={this.onNotify}
        data={this.state.data}
      >
        {({ values, handleValueChanges, onSubmit, errorMessages }) => (
          <Box column>
            {!recipientType && (
              <fieldset>
                <FormField label="RecipientType">
                  <Select
                    inField
                    options={[
                      { value: 'ALL', label: 'ALL' },
                      { value: 'GROUP', label: 'GROUP' },
                      { value: 'USER', label: 'USER' },
                    ]}
                    onSearch={false}
                    value={values.recipientType}
                    onChange={e => {
                      handleValueChanges({
                        target: { name: 'recipientType', value: e.value },
                      });
                    }}
                  />
                </FormField>
              </fieldset>
            )}
            {/* (!recipients || !recipients.length) && (
              <FormField label="Recipients">
                <input
                  name="recipients"
                  type="text"
                  onBlur={onBlur}
                  value={values.recipients}
                  onChange={handleValueChanges}
                />
              </FormField>
            ) */}
            <fieldset>
              {messageType === 'COMMUNICATION' && (
                <InputMask
                  locale="de"
                  values={values}
                  handleValueChanges={handleValueChanges}
                  errors={errorMessages}
                />
              )}
              {messageType === 'NOTE' && (
                <div>
                  <LocaleSelector
                    activeLocale={activeLocale}
                    onActivate={this.handleLanguageSelection}
                    locales={['de', 'it']}
                  />
                  <InputMask
                    locale={activeLocale}
                    values={values}
                    handleValueChanges={handleValueChanges}
                    errors={errorMessages}
                  />
                </div>
              )}
            </fieldset>
            <fieldset>
              <FormField>
                <CheckBox
                  toggle
                  checked={values.enforceEmail}
                  disabled={this.props.updates && this.props.updates.pending}
                  label="Send Email"
                  name="enforceEmail"
                  onChange={handleValueChanges}
                />
              </FormField>
            </fieldset>
            <Button
              fill
              primary
              onClick={onSubmit}
              pending={this.props.updates && this.props.updates.pending}
              label={<FormattedMessage {...messages.send} />}
            />
          </Box>
        )}
      </FormValidation>
    );
  }
}

export default MessageInput;
