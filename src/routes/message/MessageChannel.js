import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import List from '../../components/List';
import ListItem from '../../components/ListItem';
import { getMessagesByChannel } from '../../reducers';
import Message from '../../components/Message';

class MessageChannel extends React.Component {
  static propTypes = {
    messageId: PropTypes.string.isRequired,
    messages: PropTypes.arrayOf(PropTypes.shape({})),
  };
  static defaultProps = {
    messages: null,
  };
  constructor(props) {
    super(props);
    this.state = { openMessages: [props.messageId] };
  }
  componentWillReceiveProps({ messageId }) {
    if (messageId !== this.props.messageId) {
      this.setState({ openMessages: [messageId] });
    }
  }
  render() {
    const { messages } = this.props;
    let component;
    if (messages.length === 1) {
      const msg = messages[0];
      component = (
        <Message
          createdAt={msg.createdAt}
          subject={msg.subject}
          content={msg.messageObject && msg.messageObject.content}
          sender={msg.sender}
        />
      );
    } else {
      component = (
        <List>
          {messages &&
            messages.map(msg => (
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
      );
    }
    return <div style={{ maxWidth: '35em', width: '100%' }}>{component}</div>;
  }
}

const mapStateToProps = (state, { id }) => ({
  messages: getMessagesByChannel(state, id).sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
  ),
});

export default connect(mapStateToProps)(MessageChannel);
