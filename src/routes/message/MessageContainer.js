import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Message from '../../components/Message';
import Box from '../../components/Box';
import { getMessage } from '../../reducers';

class MessageContainer extends React.Component {
  static propTypes = {
    message: PropTypes.shape({
      subject: PropTypes.string,
      messageObject: PropTypes.shape({}),
      sender: PropTypes.shape({}),
    }),
  };
  static defaultProps = {
    message: null,
  };
  render() {
    const { message: { subject, messageObject, sender } } = this.props;
    return (
      <Box tag="article" column pad align padding="medium">
        <Message
          subject={subject}
          content={messageObject && messageObject.content}
          sender={sender}
        />
      </Box>
    );
  }
}

const mapStateToProps = (state, { id }) => ({
  message: getMessage(state, id),
});

export default connect(mapStateToProps)(MessageContainer);
