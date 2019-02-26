import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import withStyles from 'isomorphic-style-loader/withStyles';
import Button from '../Button';

import s from './LocaleButton.css';

const LocaleButton = ({ onClick, active, label }) => (
  <li>
    <Button plain onClick={onClick}>
      <label className={cn(s.label, active ? s.active : null)}>
        <span>{label}</span>
      </label>
    </Button>
  </li>
);

LocaleButton.propTypes = {
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  active: PropTypes.bool.isRequired,
};

export default withStyles(s)(LocaleButton);
