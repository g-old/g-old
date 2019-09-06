import React from 'react';
import PropTypes from 'prop-types';
import Notification from '../Notification';
import Button from '../Button';
import { ICONS } from '../../constants';

const FetchError = ({ message, onRetry, isFetching }) => (
  <Notification
    state="error"
    message={`Could not fetch the data. ${message}`}
    action={
      <Button
        disabled={isFetching}
        primary
        onClick={onRetry}
        icon={
          <svg viewBox="0 0 24 24" width={24} height={24}>
            <path fill="none" stroke="#fff" strokeWidth="2" d={ICONS.retry} />
          </svg>
        }
        label="Retry"
      />
    }
  />
);

FetchError.propTypes = {
  message: PropTypes.string.isRequired,
  onRetry: PropTypes.func.isRequired,
  isFetching: PropTypes.bool,
};

FetchError.defaultProps = {
  isFetching: false,
};
export default FetchError;
