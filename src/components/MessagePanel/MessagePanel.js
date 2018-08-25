import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { createMessage, updateMessage } from '../../actions/message';
import s from './MessagePanel.css';
import MessageInput from '../MessageInput';
import { getMessageUpdates } from '../../reducers';

class MessagePanel extends React.Component {
  static propTypes = {
    createMessage: PropTypes.func.isRequired,
    updateMessage: PropTypes.func.isRequired,
    messageUpdates: PropTypes.shape({}).isRequired,
  };

  static defaultProps = {};

  render() {
    const {
      updateMessage: mutateMessage,
      createMessage: makeMessage,
      messageUpdates,
    } = this.props;

    return (
      <div>
        <MessageInput
          updateMessage={mutateMessage}
          draftMode
          messageType="NOTE"
          notifyUser={makeMessage}
          updates={messageUpdates}
        />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  messageUpdates: getMessageUpdates(state),
});

const mapDispatch = {
  createMessage,
  updateMessage,
};

export default connect(
  mapStateToProps,
  mapDispatch,
)(withStyles(s)(MessagePanel));
