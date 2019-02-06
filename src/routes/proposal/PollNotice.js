import React from 'react';
import {
  defineMessages,
  FormattedMessage,
  FormattedRelative,
} from 'react-intl';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './PollNotice.css';

const messages = defineMessages({
  notice: {
    id: 'poll.running',
    defaultMessage: 'Poll is closing',
    description: 'Notice for open polls',
  },
});
const PollNotice = ({ poll }) => (
  <div className={s.root}>
    <FormattedMessage {...messages.notice} />{' '}
    <FormattedRelative value={poll.endTime} />
  </div>
);

export default withStyles(s)(PollNotice);
