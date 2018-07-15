import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Message from '../../components/Message';
import Box from '../../components/Box';
import { getMessage, getMessageUpdates } from '../../reducers';
import { createMessage } from '../../actions/message';
import List from '../../components/List';
import ListItem from '../../components/ListItem';
import MessageChannel from './MessageChannel';
import MessageForm from '../../components/MessageForm';

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
      message: { messageObject, parentId, id },
      messageUpdates,
    } = this.props;
    return (
      <Box tag="article" column pad align padding="medium">
        <MessageChannel id={parentId || id} messageId={id} />

        {messageObject &&
          messageObject.replyable && (
            <MessageForm updates={messageUpdates} onSend={this.sendReply} />
          )
        /* <div
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
          ) */
        }
      </Box>
    );
  }
}

const mapStateToProps = (state, { id }) => ({
  message: getMessage(state, id),
  messageUpdates: getMessageUpdates(state),
});

const mapDispatch = {
  createMessage,
};

export default connect(mapStateToProps, mapDispatch)(MessageContainer);
