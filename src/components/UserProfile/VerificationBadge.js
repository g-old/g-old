import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages } from 'react-intl';
import { ICONS } from 'jest-util/build/specialChars';
import { VerificationTypes } from '../../data/models/constants';
import Button from '../Button/Button';

const messages = defineMessages({
  verify: {
    id: 'labels.verifyMe',
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
          <path fill="none" stroke="#000" strokeWidth="2" d={ICONS.clock} />
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
