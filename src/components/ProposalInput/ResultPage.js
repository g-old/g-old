import React from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import Notification from '../Notification';
import Box from '../Box';
import Button from '../Button';

const messages = defineMessages({
  success: {
    id: 'notification.success',
    defaultMessage: 'Success!',
    description: 'Should notify a successful action',
  },
});

const ResultPage = ({ success, onRestart, error, onSuccess }) => {
  let component;
  if (error) {
    component = <Notification type="error" message={error} />;
  } else if (success && onSuccess) {
    component = (
      <Notification
        type="success"
        message={<FormattedMessage {...messages.success} />}
        action={
          <Button
            plain
            reverse
            icon={
              <svg viewBox="0 0 24 24" width="24px" height="24px" role="img">
                <path
                  fill="none"
                  stroke="#000"
                  strokeWidth="2"
                  d="M2,12 L22,12 M13,3 L22,12 L13,21"
                />
              </svg>
            }
            onClick={onSuccess}
            label="Visit"
          />
        }
      />
    );
  }

  return (
    <Box column align>
      {component}
      <Button label="Restart" onClick={onRestart} />
    </Box>
  );
};

export default ResultPage;
