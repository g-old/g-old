// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';

import Box from '../Box';
import CheckBox from '../CheckBox';
import FormField from '../FormField';
import Button from '../Button';
import FormValidation from '../FormValidation';
// import InputMask from './InputMask';
import LocaleSelector from './LocaleSelector';
import Select from '../Select';
import MessagesLayer from './MessagesLayer';
import Editor from '../MainEditor';
import Message from '../Message';
import { ICONS } from '../../constants';

const EMPTY = '<p></p>';

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
    const activeLocale = 'de';
    this.onNotify = this.onNotify.bind(this);
    this.state = {
      data: {
        textde: '',
        textit: '',
        subjectde: '',
        subjectit: '',
        recipients: [],
      },
      activeLocale,
    };
    this.handleLanguageSelection = this.handleLanguageSelection.bind(this);
    this.handleSelection = this.handleSelection.bind(this);
    this.onCloseLayer = this.onCloseLayer.bind(this);
    this.storageKey = `Message${props.messageType}`; // TODO find better one
  }

  componentDidMount() {
    const initialValue =
      localStorage.getItem(this.storageKey + this.state.activeLocale) ||
      '<p></p>';

    this.editor.setInitialState(initialValue);
    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState({
      data: {
        textde: localStorage.getItem(`${this.storageKey}de`) || EMPTY,
        textit: localStorage.getItem(`${this.storageKey}it`) || EMPTY,
      },
    });
  }

  componentWillReceiveProps({ updates }) {
    if (updates && updates.success) {
      this.reset();
    }
  }

  // TODO refactor
  onNotify(newValues, initialValues, options) {
    const values = Object.keys(initialValues).reduce((acc, curr) => {
      if (curr in newValues) {
        acc[curr] = newValues[curr];
      } else if (curr in initialValues) {
        if (initialValues[curr] !== EMPTY) {
          acc[curr] = initialValues[curr];
        }
      }

      return acc;
    }, {});

    const subject = { de: values.subjectde, it: values.subjectit };
    const {
      recipients = [],
      recipientType,
      messageType,
      parentId,
    } = this.props;
    const draftId = localStorage.getItem(`${this.storageKey}draftId`);

    const object = {};
    if (messageType === 'NOTE') {
      object.note = {
        ...((this.state.draftId || draftId) && { id: this.state.draftId }),
        textHtml: {
          ...(values.textde && { de: values.textde }),
          ...(values.textit && { it: values.textit }),
        },
        category: 'CIRCULAR',
      };
    } else if (messageType === 'COMMUNICATION') {
      object.communication = {
        parentId,
        textHtml: values.textde,
        replyable: true,
      };
    }
    this.props.notifyUser({
      recipientType:
        (values.recipientType && values.recipientType.value) || recipientType,
      messageType,
      ...object,
      recipients: recipients || [],
      subject,
      isDraft: options && options.draft,
      enforceEmail: values.enforceEmail,
    });
  }
  onCloseLayer() {
    this.setState({ layerOpen: false });
  }

  handleLanguageSelection(locale) {
    this.setState({ activeLocale: locale });
    const initialValue =
      localStorage.getItem(this.storageKey + locale) || EMPTY;
    this.editor.setInitialState(initialValue);
  }
  handleSelection(messageObject) {
    this.setState({
      data: {
        textde: messageObject.textHtml.de,
        textit: messageObject.textHtml.it,
      },
    });
    localStorage.setItem(`${this.storageKey}de`, messageObject.textHtml.de);
    localStorage.setItem(`${this.storageKey}it`, messageObject.textHtml.it);
    localStorage.setItem(`${this.storageKey}draftId`, messageObject.id);

    this.editor.setInitialState(
      messageObject.textHtml[this.state.activeLocale] || EMPTY,
    );

    this.onCloseLayer();
    this.setState({ draftId: messageObject.id });
  }
  reset() {
    this.editor.reset();
    localStorage.setItem(`${this.storageKey}de`, EMPTY);
    localStorage.setItem(`${this.storageKey}it`, EMPTY);
    this.setState({
      data: {
        textde: '',
        textit: '',
        subjectde: '',
        subjectit: '',
        recipients: [],
        enforceEmail: false,
      },
      draftId: null,
    });
  }

  render() {
    const { updates = {}, messageType, recipientType } = this.props;
    const { activeLocale } = this.state;
    return (
      <React.Fragment>
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
          {({ values, handleValueChanges, onSubmit }) => (
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
              <Button
                plain
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    width="24px"
                    height="24px"
                    role="img"
                    aria-label="link"
                  >
                    <path
                      fill="none"
                      stroke="#000"
                      strokeWidth="2"
                      d={ICONS.template}
                    />
                  </svg>
                }
                label="Import draft"
                onClick={() =>
                  this.setState({
                    layerOpen: true,
                  })
                }
              />
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
                  <Editor
                    ref={
                      elm => (this.editor = elm) // eslint-disable-line
                    }
                    initialValue={this.state.initialValue}
                    onChange={value => {
                      handleValueChanges({
                        target: { name: `text${activeLocale}`, value },
                      });
                      localStorage.setItem(
                        this.storageKey + activeLocale,
                        value,
                      );
                    }}
                  />
                )}
                {messageType === 'NOTE' && (
                  <div>
                    <LocaleSelector
                      activeLocale={activeLocale}
                      onActivate={this.handleLanguageSelection}
                      locales={['de', 'it']}
                    />
                    <fieldset>
                      <FormField label="Subject">
                        <input
                          name={`subject${activeLocale}`}
                          type="text"
                          value={values[`subject${activeLocale}`]}
                          onChange={handleValueChanges}
                        />
                      </FormField>
                      <FormField>
                        <Editor
                          ref={
                            elm => (this.editor = elm) // eslint-disable-line
                          }
                          initialValue={this.state.initialValue}
                          onChange={value => {
                            handleValueChanges({
                              target: {
                                name: `text${activeLocale}`,
                                value,
                              },
                            });
                            localStorage.setItem(
                              this.storageKey + activeLocale,
                              value,
                            );
                          }}
                        />
                      </FormField>
                      <FormField label="Preview">
                        <div
                          style={{ marginLeft: 'auto', marginRight: 'auto' }}
                        >
                          <Message
                            subject={values[`subject${activeLocale}`]}
                            content={values[`text${activeLocale}`]}
                          />
                        </div>
                      </FormField>
                      {/* <InputMask
                      locale={activeLocale}
                      values={values}
                      handleValueChanges={handleValueChanges}
                      errors={errorMessages}
                    /> */}
                    </fieldset>
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
              <Box>
                <Button
                  primary
                  onClick={onSubmit}
                  pending={this.props.updates && this.props.updates.pending}
                  label={<FormattedMessage {...messages.send} />}
                />{' '}
                <Button
                  primary
                  onClick={e => onSubmit(e, { draft: true })}
                  pending={this.props.updates && this.props.updates.pending}
                  label="Save as draft"
                />
              </Box>
            </Box>
          )}
        </FormValidation>
        {this.state.layerOpen && (
          <MessagesLayer
            onClose={this.onCloseLayer}
            onSelection={this.handleSelection}
          />
        )}
      </React.Fragment>
    );
  }
}

export default MessageInput;
