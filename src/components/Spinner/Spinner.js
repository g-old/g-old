import React from 'react';
import withStyles from 'isomorphic-style-loader/withStyles';
import s from './Spinner.css';

const Spinner = () => (
  <svg
    className={s.root}
    viewBox="0 0 48 48"
    version="1.1"
    role="img"
    aria-label="Spinning"
  >
    <circle
      cx="24"
      cy="24"
      r="12"
      stroke="#167ac6"
      strokeWidth="3"
      fill="none"
    />
  </svg>
);

export default withStyles(s)(Spinner);
