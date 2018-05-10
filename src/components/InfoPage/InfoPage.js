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
  privacy: {
    id: 'privacy',
    defaultMessage: 'Privacy',
    description: 'Privacy label',
  },
  faq: {
    id: 'faq',
    defaultMessage: 'Frequently asked questions',
    description: 'FAQ label',
  },
  contact: {
    id: 'contact',
    defaultMessage: 'Contact',
    description: 'Contact label',
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
    const privacyPromise = this.handleLoading('privacy');
    const contactPromise = this.handleLoading('contact');
    await Promise.all([
      firstStepsPromise,
      helpPromise,
      privacyPromise,
      contactPromise,
    ]);
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
      <Accordion active={this.props.firstSteps ? 0 : -1}>
        <AccordionPanel heading={<FormattedMessage {...messages.firstSteps} />}>
          {!this.state.firstSteps && (
            <FormattedMessage {...messages.firstSteps} />
          )}
          {this.state.firstSteps && <Page {...this.state.firstSteps} />}
        </AccordionPanel>
        <AccordionPanel heading={<FormattedMessage {...messages.faq} />}>
          {!this.state.help && <FormattedMessage {...messages.faq} />}
          {this.state.help && <Page {...this.state.help} />}
        </AccordionPanel>
        <AccordionPanel heading={<FormattedMessage {...messages.contact} />}>
          {!this.state.contact && <FormattedMessage {...messages.contact} />}
          {this.state.contact && <Page {...this.state.contact} />}
        </AccordionPanel>
        <AccordionPanel heading={<FormattedMessage {...messages.privacy} />}>
          {!this.state.privacy && <FormattedMessage {...messages.privacy} />}
          {this.state.privacy && <Page {...this.state.privacy} />}
        </AccordionPanel>
      </Accordion>
    );
  }
}

export default Help;
