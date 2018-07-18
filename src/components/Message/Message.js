import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Message.css';
import Box from '../Box';
import UserThumbnail from '../UserThumbnail';
import MessagePreview from '../MessagePreview';

class Message extends React.Component {
  static propTypes = {
    subject: PropTypes.string.isRequired,
    sender: PropTypes.shape({}).isRequired,
    content: PropTypes.string.isRequired,
    preview: PropTypes.bool,
    createdAt: PropTypes.string.isRequired,
  };

  static defaultProps = {
    preview: null,
  };

  render() {
    const { subject, content, sender, preview, createdAt } = this.props;
    if (preview) {
      // TODO extract to own component?
      return <MessagePreview sender={sender} createdAt={createdAt} />;
    }
    return (
      <Box column className={s.root}>
        <div className={s.subject}>
          <span>{subject}</span>
        </div>
        <div
          className={s.content}
          dangerouslySetInnerHTML={{ __html: content }}
        />
        <div className={s.content}>
          <UserThumbnail user={sender} />
        </div>
      </Box>
    );
  }
}

export default withStyles(s)(Message);
