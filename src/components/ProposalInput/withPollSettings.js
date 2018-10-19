import React from 'react';
import { defineMessages, injectIntl, intlShape } from 'react-intl';

const messages = defineMessages({
  proposed: {
    id: 'proposalManager.phaseOnePoll',
    defaultMessage: 'TR: 25 - PHASE ONE - NO STATEMENTS',
    description: 'PhaseOnePoll presets',
  },
  voting: {
    id: 'proposalManager.phaseTwoPoll',
    defaultMessage: 'TR: 50 - PHASE TWO - WITH STATEMENTS',
    description: 'PhaseTwoPoll presets',
  },
  survey: {
    id: 'proposalManager.survey',
    defaultMessage: 'Survey',
    description: 'Survey presets',
  },
});

const defaultPollSettings = {
  proposed: {
    withStatements: true,
    unipolar: true,
    threshold: 25,
    secret: false,
    thresholdRef: {
      label: 'ALL',
      value: 'all',
    },
  },
  voting: {
    withStatements: true,
    unipolar: false,
    threshold: 50,
    secret: false,
    thresholdRef: {
      label: 'VOTERS',
      value: 'voters',
    },
  },
  survey: {
    withStatements: false,
    unipolar: false,
    threshold: 100,
    secret: false,
    thresholdRef: {
      label: 'VOTERS',
      value: 'voters',
    },
  },
};

const isPollValid = poll => {
  if (!(poll in defaultPollSettings)) {
    throw new Error(`Poll does not exist: ${poll}`);
  }
  return poll;
};

function withPollSettings(WrappedComponent, availablePresets) {
  let availablePollList = ['proposed', 'voting', 'survey'];
  if (availablePresets) {
    availablePollList = availablePresets.map(isPollValid);
  }
  return injectIntl(
    class extends React.Component {
      static propTypes = {
        intl: intlShape.isRequired,
      };

      constructor(props) {
        super(props);

        this.state = {
          pollPresets: availablePollList.map(p => ({
            value: p,
            label: props.intl.formatMessage(messages[p]),
          })),
        };
      }

      get polls() {
        const { intl } = this.props;
        return [
          {
            value: 'proposed',
            label: intl.formatMessage(messages.phaseOnePoll),
          },
          {
            value: 'voting',
            label: intl.formatMessage(messages.phaseTwoPoll),
          },
          {
            value: 'survey',
            label: intl.formatMessage(messages.survey),
          },
        ];
      }

      render() {
        const { pollPresets } = this.state;
        return (
          <WrappedComponent
            defaultPollSettings={defaultPollSettings}
            availablePolls={pollPresets}
            {...this.props}
          />
        );
      }
    },
  );
}

export default withPollSettings;
