import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/withStyles';
import { FormattedRelative } from 'react-intl';
import Avatar from '../Avatar';

import s from './MessagePreview.css';

const MessagePreview = ({ sender, subject, numReplies, createdAt }) => {
  const messageCount = numReplies > 0 ? <span>{`(${numReplies})`}</span> : null;
  return (
    <div className={s.preview}>
      <div>
        {/* <img alt="img" src={sender.thumbnail} /> */}
        <Avatar user={sender} />
        <span className={s.subject}>{subject}</span>
        {messageCount}
      </div>
      <FormattedRelative value={parseInt(createdAt, 10)} />
    </div>
  );
};
MessagePreview.propTypes = {
  sender: PropTypes.shape({}).isRequired,
  createdAt: PropTypes.string.isRequired,
  subject: PropTypes.string,
  numReplies: PropTypes.number,
};
MessagePreview.defaultProps = {
  subject: null,
  numReplies: null,
};

export default withStyles(s)(MessagePreview);
