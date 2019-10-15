import React from 'react';
import PropTypes from 'prop-types';
import { WizardContext } from '../Wizard/wizard-context';

class Steps extends React.Component {
  static propTypes = {
    wizard: PropTypes.shape({}).isRequired,
    children: PropTypes.arrayOf(PropTypes.node).isRequired,
    step: PropTypes.shape({}).isRequired,
  };

  static defaultProps = {};

  componentWillMount() {
    const { wizard } = this.props;
    /* eslint-disable react/destructuring-assignment */
    const steps = React.Children.map(
      React.Children.toArray(this.props.children).filter(o => o),
      ({ props: { children, render, ...config } }) => config,
    );
    /* eslint-enable react/destructuring-assignment */

    // access context over props
    wizard.init(steps);
  }

  render() {
    const { children, wizard, step } = this.props;
    const { id: activeId } = step || wizard.step;

    const [child = null] = React.Children.toArray(children).filter(
      ({ props: { id } }) => id === activeId,
    );

    return child;
  }
}

export default props => (
  <WizardContext.Consumer>
    {wizard => <Steps wizard={wizard} {...props} />}
  </WizardContext.Consumer>
);
