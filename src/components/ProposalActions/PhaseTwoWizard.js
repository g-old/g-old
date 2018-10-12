/* @flow */
import React from 'react';
import Wizard from '../Wizard';
import StepPage from '../StepPage';
import Steps from '../Steps';
import Step from '../Steps/Step';
import Meter from '../Meter';
import DateInput from '../ProposalInput/DateInput';
import PollType from '../ProposalInput/PollType';
import InputPreview from '../ProposalInput/InputPreview';
import ResultPage from '../ProposalInput/ResultPage';

import { isAdmin } from '../../organization';
import Navigation from '../ProposalInput/Navigation';
import { concatDateAndTime, utcCorrectedDate } from '../../core/helpers';
import type {
  PollTypeTypes,
  PollSettingsShape,
  ValueType,
} from '../ProposalInput';

type Props = {
  defaultPollSettings: { [PollTypeTypes]: PollSettingsShape },
  availablePolls: { value: PollTypeTypes, label: string }[],
  onUpdate: () => Promise<boolean>,
  defaultPollType: PollTypeTypes,
  user: UserShape,
  workTeamId?: ID,
  proposalId: ID,
};

type State = {
  ...PollSettingsShape,
  dateTo?: string,
  timeTo?: string,
  pollType: { value: PollTypeTypes, label: string },
  options: OptionShape[],
};

const handleNext = ({ push }) => push();

class PhaseTwoWizard extends React.Component<Props, State> {
  static defaultProps = {
    workTeamId: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      options: [],
      pollType:
        props.availablePolls.find(
          poll => poll.value === props.defaultPollType,
        ) || props.availablePolls[0],
      dateTo: '',
      timeTo: '',
      ...props.defaultPollSettings[props.defaultPollType || 'proposed'],
    };

    this.handleValueSaving = this.handleValueSaving.bind(this);
    this.handleUpdate = this.handleUpdate.bind(this);
  }

  handleValueSaving: (ValueType[]) => void;

  handleUpdate: () => void;

  handleValueSaving(data: ValueType[]) {
    const newData = data.reduce((acc, curr) => {
      acc[curr.name] = curr.value;
      return acc;
    }, {});
    this.setState(newData);
  }

  handleUpdate() {
    const { onUpdate, workTeamId, proposalId } = this.props;
    const startTime = null;
    let endTime = null;
    const {
      dateTo,
      timeTo,
      withStatements,
      secret,
      threshold,
      thresholdRef,
      unipolar,
      options,
    } = this.state;

    if (dateTo || timeTo) {
      const date = dateTo || utcCorrectedDate(3).slice(0, 10);
      const time = timeTo || utcCorrectedDate().slice(11, 16);

      endTime = concatDateAndTime(date, time);
    }

    onUpdate({
      ...(workTeamId && { workTeamId }),
      id: proposalId,
      // state: pollType.value,
      poll: {
        options: options.map((o, i) => ({
          description: { de: o.description },
          pos: i,
          order: i,
        })),
        extended: !!options.length,
        startTime,
        endTime,
        secret,
        threshold,
        mode: {
          withStatements,
          unipolar,
          thresholdRef,
        },
      },
    });
    return true;
  }

  render() {
    const { availablePolls, defaultPollSettings, user } = this.props;
    const {
      secret,
      unipolar,
      withStatements,
      threshold,
      thresholdRef,
      pollType,
      timeTo,
      dateTo,
    } = this.state;
    return (
      <Wizard onNext={handleNext} basename="">
        {({ steps, step }) => (
          <StepPage>
            <Meter
              strokeWidth={1}
              percent={((steps.indexOf(step) + 1) / steps.length) * 100}
            />
            <Steps>
              <Step id="date">
                <DateInput
                  onExit={this.handleValueSaving}
                  data={{ timeTo, dateTo }}
                />
              </Step>
              <Step id="poll">
                <PollType
                  availablePolls={availablePolls.filter(
                    poll => poll.value === 'voting',
                  )}
                  defaultPollSettings={defaultPollSettings}
                  data={{
                    pollType,
                    secret,
                    unipolar,
                    withStatements,
                    threshold,
                    thresholdRef,
                  }}
                  onExit={this.handleValueSaving}
                  advancedModeOn={isAdmin(user)}
                />
              </Step>
              <Step id="preview">
                <InputPreview
                  {...this.state}
                  pollOnly
                  onExit={this.handleValueSaving}
                  state={pollType.value}
                />
              </Step>
              <Step id="final">
                <ResultPage />
              </Step>
            </Steps>
            <Navigation onSubmit={this.handleUpdate} />
          </StepPage>
        )}
      </Wizard>
    );
  }
}

export default PhaseTwoWizard;
