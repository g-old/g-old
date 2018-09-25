import React from 'react';
import PropTypes from 'prop-types';
import { WizardContext } from '../Wizard/wizard-context';

const createStepComponent = name => {
  const StepComponent = props => (
    <WizardContext.Consumer>{() => props.children}</WizardContext.Consumer>
  );
  StepComponent.propTypes = {
    children: PropTypes.arrayOf(PropTypes.node).isRequired,
  };
  StepComponent.displayName = name;
  return StepComponent;
};

export default createStepComponent('Step');
