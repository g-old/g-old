// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';
import {
  recipientValidation,
  textValidation,
  subjectValidation,
  lazyValidationFailure,
  EMPTY,
} from './validationFns';
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
    draftMode: PropTypes.boolean,
  };

  static defaultProps = {
    notifyGroup: null,
    recipients: null,
    parentId: null,
    draftMode: null,
  };
  constructor(props) {
    super(props);
    const activeLocale = 'de';
    this.onNotify = this.onNotify.bind(this);
    this.state = {
      data: {
        textde: EMPTY,
        textit: EMPTY,
        subjectde: ' ',
        subjectit: ' ',
        recipients: props.recipients || [],
        messageType: props.messageType,
        recipientType: props.recipientType,
      },
      activeLocale,
    };
    this.handleLanguageSelection = this.handleLanguageSelection.bind(this);
    this.handleSelection = this.handleSelection.bind(this);
    this.onCloseLayer = this.onCloseLayer.bind(this);
    this.onOpenLayer = this.onOpenLayer.bind(this);

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
  onNotify(newValues, state, options) {
    const {
      recipients = [],
      recipientType,
      messageType,
      parentId,
    } = this.props;

    if (lazyValidationFailure(state.errors, options && options.draft)) {
      return;
    }

    const values = Object.keys(state).reduce((acc, curr) => {
      if (curr in newValues) {
        acc[curr] = newValues[curr];
      } else if (curr in state) {
        if (state[curr] !== EMPTY) {
          acc[curr] = state[curr];
        }
      }

      return acc;
    }, {});
    const subjectDe = values.subjectde.trim();
    const subjectIt = values.subjectit.trim();
    const subject = {
      ...(subjectDe.length && { de: subjectDe }),
      ...(subjectIt.length && { it: values.subjectIt }),
    };

    const draftId = localStorage.getItem(`${this.storageKey}draftId`);
    const object = {};
    if (messageType === 'NOTE') {
      object.note = {
        ...((this.state.draftId || draftId) && {
          id: this.state.draftId || draftId,
        }),
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
  onOpenLayer(e) {
    if (e) {
      e.stopPropagation();
    }
    this.setState({ layerOpen: true });
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
    localStorage.removeItem(`${this.storageKey}draftId`);

    this.setState({
      data: {
        textde: EMPTY,
        textit: EMPTY,
        subjectde: ' ',
        subjectit: ' ',
        recipients: this.props.recipients || [],
        enforceEmail: false,
        messageType: this.props.messageType,
        recipientType: this.props.recipientType,
      },
      draftId: null,
    });
  }

  renderTextInputs(handleValueChanges, activeLocale, values, errorMessages) {
    const subject = `subject${activeLocale}`;
    const editor = `text${activeLocale}`;
    return (
      <React.Fragment>
        <fieldset>
          <FormField label="subject" error={errorMessages[`${subject}Error`]}>
            <input
              name={subject}
              type="text"
              value={values[subject]}
              onChange={handleValueChanges}
            />
          </FormField>
          <FormField error={errorMessages[`${editor}Error`]}>
            <div style={{ padding: '0 1.5em' }}>
              <Editor
                ref={
                  elm => (this.editor = elm) // eslint-disable-line
                }
                initialValue={this.state.initialValue}
                onChange={value => {
                  handleValueChanges({ target: { name: editor, value } });
                  localStorage.setItem(this.storageKey + activeLocale, value);
                }}
              />
            </div>
          </FormField>
        </fieldset>
        <FormField label="Preview">
          <div>
            <Message subject={values[subject]} content={values[editor]} />
          </div>
        </FormField>
      </React.Fragment>
    );
  }

  render() {
    const { updates = {}, messageType, recipientType, draftMode } = this.props;
    const { activeLocale } = this.state;
    return (
      <div
        style={{
          margin: '0 auto',
          width: messageType === 'NOTE' ? '45em' : '30em',
        }}
      >
        <FormValidation
          lazy={draftMode} // call onSubmit even when errors are present
          updatePending={updates && updates.pending}
          validations={{
            textit: { fn: textValidation },
            textde: { fn: textValidation },
            subjectde: { fn: subjectValidation },
            subjectit: { fn: subjectValidation },
            recipients: { fn: recipientValidation },
            recipientType: {
              args: { required: true },
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
                  <FormField
                    label="RecipientType"
                    error={errorMessages.recipientTypeError}
                  >
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
              {draftMode && (
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
                  onClick={this.onOpenLayer}
                />
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
                {messageType === 'COMMUNICATION' &&
                  this.renderTextInputs(
                    handleValueChanges,
                    activeLocale,
                    values,
                    errorMessages,
                  )}
                {messageType === 'NOTE' && (
                  <div>
                    <LocaleSelector
                      activeLocale={activeLocale}
                      onActivate={this.handleLanguageSelection}
                      locales={['de', 'it']}
                    />

                    {this.renderTextInputs(
                      handleValueChanges,
                      activeLocale,
                      values,
                      errorMessages,
                    )}
                  </div>
                )}
              </fieldset>
              <fieldset>
                <FormField>
                  <CheckBox
                    toggle
                    checked={values.enforceEmail}
                    disabled={this.props.updates && this.props.updates.pending}
                    label="Enforce Email"
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
                {draftMode && (
                  <Button
                    primary
                    onClick={e => onSubmit(e, { draft: true })}
                    pending={this.props.updates && this.props.updates.pending}
                    label="Save as draft"
                  />
                )}
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
      </div>
    );
  }
}

export default MessageInput;
