import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages } from 'react-intl';
import { VerificationTypes } from '../../data/models/constants';
import Button from '../Button/Button';

const messages = defineMessages({
  verify: {
    id: 'labels.verify',
    defaultMessage: 'Verify me',
    description: 'Label to open verification process',
  },
});
const VerificationBadge = ({ status, onClick }) => {
  let sign;

  switch (status) {
    case VerificationTypes.CONFIRMED:
      sign = 'OK';
      break;
    case VerificationTypes.DENIED:
      sign = 'NOO';
      break;

    case VerificationTypes.PENDING:
      sign = (
        <svg
          height="1.5em"
          width="1.5em"
          aria-label="Clock"
          viewBox="0 0 24 24"
        >
          <path
            fill="none"
            stroke="#000"
            strokeWidth="2"
            d="M12,22 C17.5228475,22 22,17.5228475 22,12 C22,6.4771525 17.5228475,2 12,2 C6.4771525,2 2,6.4771525 2,12 C2,17.5228475 6.4771525,22 12,22 Z M12,5 L12,12 L17,12"
          />
        </svg>
      );
      break;

    default:
      sign = '0-0';
      break;
  }
  return status === VerificationTypes.UNREQUESTED ? (
    <Button plain onClick={onClick}>
      <FormattedMessage {...messages.verify} />
    </Button>
  ) : (
    <span>{sign}</span>
  );
};

VerificationBadge.propTypes = {
  status: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default VerificationBadge;
