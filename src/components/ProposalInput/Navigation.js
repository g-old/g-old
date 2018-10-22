import React from 'react';
import PropTypes from 'prop-types';
import { WizardContext } from '../Wizard/wizard-context';
import Button from '../Button';
import Box from '../Box';

const Navigation = ({ onSubmit }) => (
  <WizardContext.Consumer>
    {({ next, previous, step, steps }) => {
      const onNextClick = () => {
        const res = onSubmit();
        if (res) {
          next();
        }
      };
      return (
        <Box>
          {steps.indexOf(step) > 0 &&
            steps.indexOf(step) < steps.length - 1 && (
              <Button label="Back" onClick={previous} />
            )}
          {steps.indexOf(step) < steps.length - 2 && (
            <Button primary label="Next" onClick={next} />
          )}
          {steps.indexOf(step) === steps.length - 2 && (
            <Button primary label="Submit" onClick={onNextClick} />
          )}
        </Box>
      );
    }}
  </WizardContext.Consumer>
);

Navigation.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

export default Navigation;
