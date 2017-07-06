import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './ProfilePicture.css';
import Button from '../Button';
import { ICONS } from '../../constants';

const ProfilePicture = ({ canChange, img, onChange, updates }) => {
  let uploadBnt = null;
  if (canChange) {
    uploadBnt = (
      <Button
        icon={
          <svg viewBox="0 0 24 24" width="24px" height="24px">
            <path fill="none" stroke="#000" strokeWidth="2" d={ICONS.editBig} />
          </svg>
        }
        plain
        onClick={onChange}
        disabled={updates && updates.pending}
      />
    );
  }

  return (
    <div className={s.container}>
      <img className={s.avatar} src={img} alt="IMG" />
      <div className={s.overlay}>
        {uploadBnt}
      </div>
    </div>
  );
};

ProfilePicture.propTypes = {
  canChange: PropTypes.bool,
  img: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  updates: PropTypes.shape({ pending: PropTypes.bool }),
};

ProfilePicture.defaultProps = {
  canChange: false,
  onChange: null,
  updates: null,
};

export default withStyles(s)(ProfilePicture);
