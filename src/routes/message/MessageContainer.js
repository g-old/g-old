import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Message from '../../components/Message';
import Box from '../../components/Box';
import { getMessage, getMessageUpdates } from '../../reducers';
import { createMessage } from '../../actions/message';
import List from '../../components/List';
import ListItem from '../../components/ListItem';

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
  }
  render() {
    const {
      message: { subject, messageObject, sender, parents, parentId, createdAt },
      messageUpdates,
    } = this.props;
    return (
      <Box tag="article" column pad align padding="medium">
        <div style={{ maxWidth: '35em', width: '100%' }}>
          <List>
            {parents &&
              parents.map(p => (
                <ListItem
                  onClick={() =>
                    this.setState({
                      openMessages: this.state.openMessages.find(
                        mId => mId === p.id,
                      )
                        ? this.state.openMessages.filter(mId => mId !== p.id)
                        : this.state.openMessages.concat([p.id]),
                    })
                  }
                >
                  <Message
                    createdAt={p.createdAt}
                    preview={!this.state.openMessages.find(mId => mId === p.id)}
                    subject={p.subject}
                    content={p.messageObject && p.messageObject.content}
                    sender={p.sender}
                  />
                </ListItem>
              ))}
          </List>
        </div>

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
