// inspired by https://github.com/americanexpress/react-albus
import React from 'react';
import { createMemoryHistory } from 'history';
import PropTypes from 'prop-types';
import { WizardContext } from './wizard-context';

class Wizard extends React.Component {
  static propTypes = {
    history: PropTypes.shape({}),
    onNext: PropTypes.func.isRequired,
    basename: PropTypes.string.isRequired,
    children: PropTypes.arrayOf(PropTypes.node).isRequired,
  };

  static defaultProps = { history: null };

  constructor(props) {
    super(props);
    this.callbackRegistry = new Map();
    this.history = props.history || createMemoryHistory();
    this.init = this.init.bind(this);
    this.push = this.push.bind(this);
    this.replace = this.replace.bind(this);
    this.next = this.next.bind(this);
    this.registerCallback = this.registerCallback.bind(this);
    this.state = {
      step: { id: null },
      steps: [],
      go: this.history.go,
      history: this.history,
      init: this.init,
      next: this.next,
      previous: this.history.goBack,
      push: this.push,
      replace: this.replace,
      registerCallback: this.registerCallback,
    };
  }

  componentWillMount() {
    this.unlisten = this.history.listen(({ pathname }) =>
      this.setState({ step: this.pathToStep(pathname) }),
    );

    const { onNext } = this.props;

    if (onNext) {
      onNext(this.state);
    }
  }

  componentWillUnmount() {
    this.unlisten();
  }

  get basename() {
    const { basename } = this.props;
    return `${basename}/`;
  }

  get ids() {
    const { steps } = this.state;
    return steps.map(s => s.id);
  }

  get nextStep() {
    const { step } = this.state;
    return this.ids[this.ids.indexOf(step.id) + 1];
  }

  get callbacks() {
    return this.callbackRegistry;
  }

  init(steps) {
    this.setState({ steps }, () => {
      const step = this.pathToStep(this.history.location.pathname);
      if (step.id) {
        this.setState({ step });
      } else {
        this.history.replace(`${this.basename}${this.ids[0]}`);
      }
    });
  }

  pathToStep(pathname) {
    const id = pathname.replace(this.basename, '');
    const { steps, step: defaultStep } = this.state;
    const [step] = steps.filter(s => s.id === id);
    return step || defaultStep;
  }

  push(nextStep = this.nextStep) {
    const { step } = this.state;

    if (this.callbackRegistry.has(step.id)) {
      if (!this.callbackRegistry.get(step.id)()) {
        return;
      }
    }
    this.history.push(`${this.basename}${nextStep}`);
  }

  replace(step = this.nextStep) {
    return this.history.replace(`${this.basename}${step}`);
  }

  next() {
    const { onNext } = this.props;
    //
    if (onNext) {
      onNext(this.state);
    } else {
      this.push();
    }
  }

  registerCallback(id, callback) {
    if (!this.callbacks.has('id')) {
      this.callbacks.set(id, callback);
    }
  }

  render() {
    const { children } = this.props;

    return (
      <WizardContext.Provider value={this.state}>
        {children(this.state)}
      </WizardContext.Provider>
    );
  }
}

export default Wizard;
