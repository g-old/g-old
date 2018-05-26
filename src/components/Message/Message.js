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
    sender: PropTypes.shape({}).isRequired,
    content: PropTypes.string.isRequired,
    replyable: PropTypes.bool,
  };
  static defaultProps = {
    replyable: null,
  };

  render() {
    const { subject, content, sender, replyable } = this.props;
    return (
      <Box column className={s.root} pad>
        <Label>{subject}</Label>
        <div dangerouslySetInnerHTML={{ __html: content }} />

        <UserThumbnail user={sender} />
        {replyable && <textarea placeholder="Not working!" />}
      </Box>
    );
  }
}

export default withStyles(s)(Message);
