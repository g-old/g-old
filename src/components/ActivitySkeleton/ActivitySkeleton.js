import React from 'react';
import withStyles from 'isomorphic-style-loader/withStyles';
// eslint-disable-next-line css-modules/no-unused-class
import s from '../Activity/Activity.css';
import Skeleton from '../Skeleton';

const ActivitySkeleton = () => (
  <div className={s.container}>
    <div
      style={{ width: '80px', height: '1em', marginBottom: '1em' }}
      className={s.date}
    >
      <Skeleton />
    </div>
    <div style={{ width: '100%', height: '1.5em', marginBottom: '1em' }}>
      <Skeleton />
    </div>

    <div style={{ width: '100%', height: '3em' }}>
      <Skeleton />
    </div>
  </div>
);

export default withStyles(s)(ActivitySkeleton);
