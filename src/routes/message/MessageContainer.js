import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import Textarea from 'react-textarea-autosize'; // TODO replace with contenteditable
import Message from '../../components/Message';
import Box from '../../components/Box';
import { getMessage, getMessageUpdates, getSessionUser } from '../../reducers';
import { createMessage } from '../../actions/message';
import List from '../../components/List';
import ListItem from '../../components/ListItem';
import FormValidation from '../../components/FormValidation';
import Button from '../../components/Button';
import FormField from '../../components/FormField';

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

class MessageContainer extends React.Component {
  static propTypes = {
    message: PropTypes.shape({
      subject: PropTypes.string,
      messageObject: PropTypes.shape({}),
      sender: PropTypes.shape({}),
    }),
    messageUpdates: PropTypes.shape({}).isRequired,
    createMessage: PropTypes.func.isRequired,
  };
  static defaultProps = {
    message: null,
  };

  constructor(props) {
    super(props);
    this.state = { openMessages: [] };
    this.sendReply = this.sendReply.bind(this);
  }
  sendReply(values) {
    const { message } = this.props;
    const { subject, sender, parentId, id } = message;
    this.props.createMessage({
      parentId: parentId || id,
      recipientType: 'USER',
      messageType: 'COMMUNICATION',
      recipients: [sender.id],
      subject: { de: `Re: ${subject}` },
      communication: {
        textHtml: values.text,
        replyable: true,
      },
    });
  }
  renderMessages(messageList) {
    return (
      <div style={{ maxWidth: '35em', width: '100%' }}>
        <List>
          {messageList &&
            messageList.map(msg => (
              <ListItem
                onClick={() =>
                  this.setState({
                    openMessages: this.state.openMessages.find(
                      mId => mId === msg.id,
                    )
                      ? this.state.openMessages.filter(mId => mId !== msg.id)
                      : this.state.openMessages.concat([msg.id]),
                  })
                }
              >
                <Message
                  createdAt={msg.createdAt}
                  preview={!this.state.openMessages.find(mId => mId === msg.id)}
                  subject={msg.subject}
                  content={msg.messageObject && msg.messageObject.content}
                  sender={msg.sender}
                />
              </ListItem>
            ))}
        </List>
      </div>
    );
  }
  render() {
    const {
      message: {
        subject,
        messageObject,
        sender,
        parents,
        replies,
        parentId,
        createdAt,
      },
      messageUpdates,
    } = this.props;
    return (
      <Box tag="article" column pad align padding="medium">
        {this.renderMessages(parents)}
        <Message
          createdAt={createdAt}
          parents={parents}
          parentId={parentId}
          updates={messageUpdates}
          subject={subject}
          content={messageObject && messageObject.content}
          sender={sender}
          replyable={messageObject && messageObject.replyable}
          onReply={this.props.createMessage}
        />
        {this.renderMessages(replies)}

        {messageObject &&
          messageObject.replyable && (
            <div
              style={{
                width: '100%',
                maxWidth: '35em',
                paddingTop: '2em',
                borderTop: '2px solid #eee',
              }}
            >
              <FormValidation
                submit={this.sendReply}
                validations={{ text: { args: { required: true } } }}
                data={{ text: '' }}
              >
                {({ values, onSubmit, handleValueChanges, errorMessages }) => (
                  <Box column>
                    <FormField label="Reply" error={errorMessages.textError}>
                      <Textarea
                        disabled={messageUpdates.pending}
                        name="text"
                        useCacheForDOMMeasurements
                        placeholder="Not working"
                        value={values.text}
                        onChange={handleValueChanges}
                        minRows={2}
                      />
                    </FormField>
                    <Button
                      primary
                      disabled={messageUpdates.pending}
                      onClick={onSubmit}
                      label={<FormattedMessage {...messages.send} />}
                    />
                  </Box>
                )}
              </FormValidation>
            </div>
          )}
      </Box>
    );
  }
}

const mapStateToProps = (state, { id }) => ({
  message: getMessage(state, id),
  messageUpdates: getMessageUpdates(state),
  user: getSessionUser(state),
});

const mapDispatch = {
  createMessage,
};

export default connect(mapStateToProps, mapDispatch)(MessageContainer);
