import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages } from 'react-intl';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './RoleBadge.css';
import { isViewer, isVoter } from '../../organization';

const messages = defineMessages({
  viewer: {
    id: 'labels.viewer',
    defaultMessage: 'Viewer',
    description: 'Label viewer',
  },
  voter: {
    id: 'labels.voter',
    defaultMessage: 'Voter',
    description: 'Label voter',
  },
});
const RoleBadge = ({ groups }) => {
  let messageId;
  if (isVoter({ groups })) {
    messageId = 'voter';
  } else if (isViewer({ groups })) {
    messageId = 'viewer';
  } else {
    return null;
  }
  return (
    <div className={s.root}>
      <FormattedMessage {...messages[messageId]} />
    </div>
  );
};

RoleBadge.propTypes = {
  groups: PropTypes.number.isRequired,
};

export default withStyles(s)(RoleBadge);
