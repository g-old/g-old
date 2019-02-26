import React from 'react';
import withStyles from 'isomorphic-style-loader/withStyles';
// eslint-disable-next-line css-modules/no-unused-class
import s from '../UserNotification/UserNotification.css';

import Skeleton from '../Skeleton';

const UserNotificationSkeleton = () => (
  // eslint-disable-next-line
  <div style={{ width: '100%', maxWidth: '45em' }}>
    <div className={s.container}>
      <div style={{ height: '42px', width: '42px' }}>
        <Skeleton />
      </div>
      <div style={{ height: '1.5em', width: '80%' }} className={s.content}>
        <Skeleton />
        <div style={{ height: '1em', width: '200px' }} className={s.date}>
          <Skeleton />
        </div>
      </div>
    </div>
  </div>
);

export default withStyles(s)(UserNotificationSkeleton);
