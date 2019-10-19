/* @flow */
import React from 'react';
import withStyles from 'isomorphic-style-loader/withStyles';
import { defineMessages, injectIntl, IntlShape } from 'react-intl';

import s from './ApprovalProcess.css';
import Box from '../Box';
import StepPage from '../StepPage';
import Wizard from '../Wizard';
import Steps from '../Steps';
import Step from '../Steps/Step';
import Meter from '../Meter';
import ContentApprovation from './ContentApprovation';
import TopicApprovation from './TopicApprovation';
import { ApprovalStates } from '../../organization';

import Navigation from './Navigation';

export type Value = { value: Number, label: string };
type Props = {
  proposal: ProposalShape,
  onSubmit: ([Value, Value]) => null,
  intl: IntlShape,
};
type State = { contentApproved: Value, topicApproved: Value };

const messages = defineMessages({
  yes: {
    id: 'command.yes',
    defaultMessage: 'Yes',
    description: 'Positive answer',
  },
  no: {
    id: 'command.no',
    defaultMessage: 'No',
    description: 'Negative answer',
  },
});

class ApprovalProcess extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      contentApproved:
        props.proposal &&
        this.getApprovalState(props.proposal.approvalState, [
          ApprovalStates.CONTENT_APPROVED,
          ApprovalStates.CONTENT_DENIED,
        ]),
      topicApproved:
        props.proposal &&
        this.getApprovalState(props.proposal.approvalState, [
          ApprovalStates.TOPIC_APPROVED,
          ApprovalStates.TOPIC_DENIED,
        ]),
    };
    this.handleValueSaving = this.handleValueSaving.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  static propTypes = {};

  static defaultProps = {};

  handleValueSaving(data) {
    const newData = data.reduce((acc, curr) => {
      if (curr.value) {
        acc[curr.name] = curr.value;
      }
      return acc;
    }, {});
    this.setState(newData);
  }

  handleSubmit() {
    const { onSubmit } = this.props;
    const { contentApproved, topicApproved } = this.state;
    onSubmit([contentApproved, topicApproved]);
  }

  getApprovalState(value, state) {
    const { intl } = this.props;
    // eslint-disable-next-line no-bitwise
    if (value & state[0]) {
      return { value: state[0], label: intl.formatMessage(messages.yes) };
    }
    // eslint-disable-next-line no-bitwise
    if (value & state[1]) {
      return { value: state[1], label: intl.formatMessage(messages.no) };
    }
    throw new Error('state-not-recognized');
  }

  render() {
    const {
      proposal: { body, summary, title, image },
    } = this.props;
    const { contentApproved, topicApproved } = this.state;
    return (
      <Box fill column>
        <Wizard basename="">
          {({ steps, step }) => (
            <StepPage>
              <Box pad>
                <Meter
                  className={s.stroke}
                  trailWidth={2}
                  trailColor="#eee"
                  strokeWidth={1}
                  percent={((steps.indexOf(step) + 1) / steps.length) * 100}
                />
              </Box>
              <Steps>
                <Step id="content">
                  <ContentApprovation
                    data={{ contentApproved }}
                    text={body}
                    summary={summary}
                    title={title}
                    image={image}
                    onExit={this.handleValueSaving}
                  />
                </Step>
                <Step id="topic">
                  <TopicApprovation
                    data={{ topicApproved }}
                    text={body}
                    onExit={this.handleValueSaving}
                  />
                </Step>
                <Step id="final">
                  <Box> </Box>
                </Step>
              </Steps>
              <Navigation onSubmit={this.handleSubmit} />
            </StepPage>
          )}
        </Wizard>
      </Box>
    );
  }
}

export default withStyles(s)(injectIntl(ApprovalProcess));
