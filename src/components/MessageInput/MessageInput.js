// @flow
import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { defineMessages, FormattedMessage } from 'react-intl';
import {
  recipientValidation,
  textValidation,
  subjectValidation,
  lazyValidationFailure,
  EMPTY,
} from './validationFns';
import s from './MessageInput.css';
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
// import Message from '../Message';
import NoticeLayer from './NoticeLayer';
import Notification from '../Notification';

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
      success: PropTypes.bool,
    }).isRequired,
    notifyGroup: PropTypes.bool,
    recipients: PropTypes.arrayOf(PropTypes.string),
    recipientType: PropTypes.oneOfType(['USER', 'GROUP']).isRequired,
    messageType: PropTypes.oneOfType(['COMMUNICATION', 'NOTE']).isRequired,
    parentId: PropTypes.string,
    draftMode: PropTypes.boolean,
    updateMessage: PropTypes.func.isRequired,
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
    this.unloadDraft = this.unloadDraft.bind(this);
    this.retrieveValue = this.retrieveValue.bind(this);
    this.storeValues = this.storeValues.bind(this);
    this.storageKey = `Message${props.messageType}`; // TODO find better one
  }

  componentDidMount() {
    const initialValue =
      localStorage.getItem(this.storageKey + this.state.activeLocale) ||
      '<p></p>';

    this.editor.setInitialState(initialValue);

    const draftId = this.retrieveValue('draftId'); // loadMessage if draftid is present

    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState({
      data: {
        textde: this.retrieveValue('de') || EMPTY,
        textit: this.retrieveValue('it') || EMPTY,
      },
      isPublished: this.retrieveValue('isPublished'),
      draftId,
    });
  }

  componentWillReceiveProps({ updates }) {
    if (updates && updates.success) {
      if (!(this.props.updates && this.props.updates.success)) {
        if (!this.state.saving) {
          this.reset();
        } else {
          const draftId = updates.success.startsWith('mo')
            ? updates.success.slice(2)
            : updates.success;

          this.setState({
            draftId,
          }); // success was initialized with the mId
        }
      }
    }
  }

  // TODO refactor
  onNotify(newValues, state, options) {
    const { recipients = [], recipientType, messageType } = this.props;
    const isDraft = options && options.draft;
    const { draftId } = this.state;
    if (lazyValidationFailure(state.errors, isDraft)) {
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
      ...(subjectIt.length && { it: subjectIt }),
    };

    const object = {};
    if (messageType === 'NOTE') {
      object.note = {
        ...(draftId && {
          id: draftId,
        }),
        textHtml: {
          ...(values.textde && { de: values.textde }),
          ...(values.textit && { it: values.textit }),
        },
        category: 'CIRCULAR',
      };
    } else if (messageType === 'COMMUNICATION') {
      object.communication = {
        textHtml: values.textde,
        replyable: true,
      };
    }
    const message = {
      recipientType:
        (values.recipientType && values.recipientType.value) || recipientType,
      messageType,
      ...object,
      recipients: recipients || [],
      subject,
      isDraft,
      enforceEmail: values.enforceEmail,
    };
    if (options && options.update) {
      this.props.updateMessage(message);
    } else if (isDraft && !draftId) {
      this.setState({ saving: isDraft }, () => this.props.notifyUser(message));
    } else {
      this.setState({
        showNotice: true,
        message,
        layerOpen: true,
      });
    }

    /* else if (isDraft && isPublished && draftId) {
      this.setState({ showNotice: true, message, layerOpen: true });
    } else {
      this.setState({ saving: isDraft }, () => this.props.notifyUser(message));
    } */
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
    // this.setState({ initialValue });
  }
  storeValues(keyValues) {
    Object.keys(keyValues).map(key =>
      localStorage.setItem(this.storageKey + key, keyValues[key]),
    );
  }
  retrieveValue(key) {
    return localStorage.getItem(this.storageKey + key);
  }
  handleSelection(messageObject) {
    this.setState({
      data: {
        textde: messageObject.textHtml.de,
        textit: messageObject.textHtml.it,
      },
      isPublished: messageObject.isPublished,
      draftId: messageObject.id,
    });

    this.storeValues({
      de: messageObject.textHtml.de,
      it: messageObject.textHtml.it,
      draftId: messageObject.id,
      isPublished: messageObject.isPublished,
    });
    /*  localStorage.setItem(`${this.storageKey}de`, messageObject.textHtml.de);
    localStorage.setItem(`${this.storageKey}it`, messageObject.textHtml.it);
    localStorage.setItem(`${this.storageKey}draftId`, messageObject.id);
*/
    this.editor.setInitialState(
      messageObject.textHtml[this.state.activeLocale] || EMPTY,
    );
    /* this.setState({
      initialValue: messageObject.textHtml[this.state.activeLocale] || EMPTY,
    }); */

    this.onCloseLayer();
  }
  reset() {
    this.editor.reset();
    localStorage.setItem(`${this.storageKey}de`, EMPTY);
    localStorage.setItem(`${this.storageKey}it`, EMPTY);
    localStorage.removeItem(`${this.storageKey}draftId`);
    localStorage.removeItem(`${this.storageKey}isPublished`);

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
      isPublished: null,
      showNotice: false,
      layerOpen: false,
    });
  }

  unloadDraft() {
    if (this.state.draftId) {
      localStorage.removeItem(`${this.storageKey}draftId`);
      localStorage.removeItem(`${this.storageKey}isPublished`);

      this.setState({ draftId: null, isPublished: null });
    }
  }

  renderTextInputs(handleValueChanges, activeLocale, values, errorMessages) {
    const subject = `subject${activeLocale}`;
    const editor = `text${activeLocale}`;
    return (
      <React.Fragment>
        <fieldset className={s.controlBox}>
          <FormField label="subject" error={errorMessages[`${subject}Error`]}>
            <input
              name={subject}
              type="text"
              value={values[subject]}
              onChange={handleValueChanges}
            />
          </FormField>
          {this.state.draftId && (
            <Notification
              type="alert"
              message={`Working on ${
                this.state.isPublished ? 'PUBLISHED message' : 'draft'
              }!`}
              action={
                <Button primary onClick={this.unloadDraft} label="Unload" />
              }
            />
          )}
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
        {/* <FormField label="Preview">
          <div>
            <Message subject={values[subject]} content={values[editor]} />
          </div>
              </FormField> */}
      </React.Fragment>
    );
  }

  render() {
    const { updates = {}, messageType, recipientType, draftMode } = this.props;
    const { activeLocale, layerOpen, showNotice, draftId } = this.state;
    let layerComponent;
    if (layerOpen) {
      if (showNotice) {
        layerComponent = (
          <NoticeLayer
            isDraft={this.state.draftId}
            isPublished={this.state.isPublished}
            message={this.state.message}
            updates={updates}
            isSending={this.state.message && this.state.message.isDraft}
            onClose={() =>
              this.setState({ showNotice: false, layerOpen: false })
            }
            onSend={() => this.props.notifyUser(this.state.message)}
          />
        );
      } else {
        layerComponent = (
          <MessagesLayer
            onClose={this.onCloseLayer}
            onSelection={this.handleSelection}
          />
        );
      }
    }
    return (
      <div
        style={{
          margin: '0 auto',
          maxWidth: messageType === 'NOTE' ? '45em' : '30em',
        }}
      >
        <FormValidation
          lazy={draftMode}
          updatePending={
            updates && updates.pending // call onSubmit even when errors are present
          }
          validations={{
            textit: { fn: textValidation },
            textde: { fn: textValidation },
            subjectde: { fn: subjectValidation },
            subjectit: { fn: subjectValidation },
            recipients: { fn: recipientValidation },
            recipientType: { args: { required: true } },
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
              <Box className={s.controlBox} justify wrap>
                <Button
                  primary
                  disabled={updates.pending}
                  onClick={onSubmit}
                  pending={this.props.updates && this.props.updates.pending}
                  label={<FormattedMessage {...messages.send} />}
                />
                {draftMode && (
                  <React.Fragment>
                    <Button
                      disabled={updates.pending}
                      primary
                      onClick={e =>
                        onSubmit(e, {
                          draft: true,
                          excludeFields: [
                            'subjectit',
                            'subjectde',
                            'recipients',
                            'recipientType',
                          ],
                        })
                      }
                      pending={this.props.updates && this.props.updates.pending}
                      label="Save as new draft"
                    />
                    {draftId && (
                      <Button
                        disabled={updates.pending}
                        primary
                        onClick={e =>
                          onSubmit(e, {
                            draft: true,
                            update: true,
                            excludeFields: [
                              'subjectit',
                              'subjectde',
                              'recipients',
                              'recipientType',
                            ],
                          })
                        }
                        pending={
                          this.props.updates && this.props.updates.pending
                        }
                        label="Save (overwrite)"
                      />
                    )}
                  </React.Fragment>
                )}
              </Box>
            </Box>
          )}
        </FormValidation>
        {layerOpen && layerComponent}
      </div>
    );
  }
}

export default withStyles(s)(MessageInput);
