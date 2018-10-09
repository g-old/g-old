import React from 'react';
import PropTypes from 'prop-types';
import { WizardContext } from '../Wizard/wizard-context';

const createStepComponent = name => {
  const StepComponent = props => (
    <WizardContext.Consumer>
      {wizard =>
        React.Children.map(props.children, child =>
          React.cloneElement(child, {
            stepId: props.id,
            callback: wizard.registerCallback,
          }),
        )
      }
    </WizardContext.Consumer>
  );
  StepComponent.propTypes = {
    children: PropTypes.arrayOf(PropTypes.node).isRequired,
    id: PropTypes.string.isRequired,
  };
  StepComponent.displayName = name;
  return StepComponent;
};

export default createStepComponent('Step');
