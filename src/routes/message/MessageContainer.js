import React from 'react';
import Message from '../../components/Message';
import Box from '../../components/Box';

class MessageContainer extends React.Component {
  render() {
    return (
      <Box tag="article" column pad align padding="medium">
        <Message {...this.props} />
      </Box>
    );
  }
}

export default MessageContainer;
