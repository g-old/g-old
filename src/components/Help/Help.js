import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';
import Page from '../Page';
import Accordion from '../Accordion';
import AccordionPanel from '../AccordionPanel';

const messages = defineMessages({
  firstSteps: {
    id: 'help.firstSteps',
    defaultMessage: 'What to do next',
    description: 'Title of help section',
  },
});

class Help extends React.Component {
  static propTypes = {
    firstSteps: PropTypes.bool,
    locale: PropTypes.string.isRequired,
  };
  static defaultProps = {
    firstSteps: false,
  };
  constructor(props) {
    super(props);
    this.state = {};
    this.loadHelpfile = this.loadHelpfile.bind(this);
    this.handleLoading = this.handleLoading.bind(this);
  }
  async componentDidMount() {
    await this.loadHelpfile(this.props.locale);
  }
  async componentWillReceiveProps({ locale }) {
    if (this.props.locale !== locale) {
      await this.loadHelpfile(locale);
    }
  }

  async loadHelpfile() {
    const firstStepsPromise = this.handleLoading('firstSteps');
    const helpPromise = this.handleLoading('help');
    await Promise.all([firstStepsPromise, helpPromise]);
  }
  handleLoading(filename) {
    return new Promise(resolve => {
      require.ensure(
        [],
        require => {
          try {
            resolve(require(`./${filename}.${this.props.locale}.md`)); // eslint-disable-line import/no-dynamic-require
          } catch (e) {
            resolve(require(`./${filename}.md`)); // eslint-disable-line import/no-dynamic-require
          }
        },
        'about',
      );
    }).then(info => {
      this.setState({ [filename]: info });
    });
  }
  render() {
    return (
      <Accordion openMulti active={this.props.firstSteps ? 0 : -1}>
        <AccordionPanel
          heading={<FormattedMessage {...messages.firstSteps} />}
          active={this.state.panel === 'firstSteps'}
        >
          {!this.state.firstSteps && 'LOADING First Steps...'}
          {this.state.firstSteps && <Page {...this.state.firstSteps} />}
        </AccordionPanel>
        <AccordionPanel heading="FAQ" active={this.state.panel === 'help'}>
          {!this.state.help && 'LOADING Help...'}
          {this.state.help && <Page {...this.state.help} />}
        </AccordionPanel>
      </Accordion>
    );
  }
}

export default Help;
