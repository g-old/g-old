import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Message.css';
import Label from '../Label';
import Box from '../Box';
import UserThumbnail from '../UserThumbnail';

class Message extends React.Component {
  static propTypes = {
    subject: PropTypes.string.isRequired,
    message: PropTypes.string,
    messageHtml: PropTypes.string,
    sender: PropTypes.shape({}).isRequired,
  };
  static defaultProps = {
    message: null,
    messageHtml: null,
  };

  render() {
    const { subject, message, messageHtml, sender } = this.props;
    return (
      <Box column className={s.root} pad>
        <Label>{subject}</Label>
        <div dangerouslySetInnerHTML={{ __html: messageHtml || message }} />

        <UserThumbnail user={sender} />
      </Box>
    );
  }
}

export default withStyles(s)(Message);
