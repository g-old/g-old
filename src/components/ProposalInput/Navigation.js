/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';

import { WizardContext } from '../Wizard/wizard-context';
import Button from '../Button';
import Box from '../Box';

const messages = defineMessages({
  next: {
    id: 'command.next',
    defaultMessage: 'Next',
    description: 'Next',
  },
  back: {
    id: 'command.back',
    defaultMessage: 'Back',
    description: 'Back',
  },
  submit: {
    id: 'command.submit',
    defaultMessage: 'Submit',
    description: 'Short command for sending data to the server',
  },
  cancel: {
    id: 'commands.cancel',
    description: 'Short command to cancel a operation',
    defaultMessage: 'Cancel',
  },
});

const Navigation = ({ onSubmit, onCancel }) => (
  <WizardContext.Consumer>
    {({ next, previous, step, steps }) => {
      const onNextClick = () => {
        const res = onSubmit();
        if (res) {
          next();
        }
      };
      return (
        <Box between>
          {onCancel && steps.indexOf(step) === 0 && (
            <Button
              onClick={onCancel}
              label={<FormattedMessage {...messages.cancel} />}
            />
          )}
          {steps.indexOf(step) > 0 &&
            steps.indexOf(step) < steps.length - 1 && (
              <Button
                label={<FormattedMessage {...messages.back} />}
                onClick={previous}
              />
            )}
          {steps.indexOf(step) < steps.length - 2 && (
            <Button
              primary
              label={<FormattedMessage {...messages.next} />}
              onClick={next}
            />
          )}
          {steps.indexOf(step) === steps.length - 2 && (
            <Button
              primary
              label={<FormattedMessage {...messages.submit} />}
              onClick={onNextClick}
            />
          )}
        </Box>
      );
    }}
  </WizardContext.Consumer>
);

Navigation.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default Navigation;
