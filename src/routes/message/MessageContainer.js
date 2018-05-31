import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Message from '../../components/Message';
import Box from '../../components/Box';
import { getMessage, getMessageUpdates } from '../../reducers';
import { createMessage } from '../../actions/message';

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
  render() {
    const {
      message: { subject, messageObject, sender, id },
      messageUpdates,
    } = this.props;
    return (
      <Box tag="article" column pad align padding="medium">
        <Message
          id={id}
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
