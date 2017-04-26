import React from 'react';
import PropTypes from 'prop-types';

const FetchError = ({ message, onRetry }) => (
  <div>
    <p>
      Could not fetch the data. {message}
    </p>
    <button onClick={onRetry}> RETRY</button>
  </div>
);
FetchError.propTypes = {
  message: PropTypes.string.isRequired,
  onRetry: PropTypes.func.isRequired,
};
export default FetchError;
