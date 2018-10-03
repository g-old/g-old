/* @flow */
import React from 'react';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { defineMessages, injectIntl, type IntlShape } from 'react-intl';
import { concatDateAndTime, utcCorrectedDate } from '../../core/helpers';
import StepPage from '../StepPage';
import s from './ProposalInput.css';
import Box from '../Box';
import Wizard from '../Wizard';
import Steps from '../Steps';
import Step from '../Steps/Step';
import Meter from '../Meter';
import PollType from './PollType';
import ProposalBody from './ProposalBody';
import OptionInput from './OptionInput';
import DateInput from './DateInput';
import TagInput, { TAG_ID_SUFFIX } from './TagInput';
import SpokesmanInput from './SpokesmanInput';
import InputPreview from './InputPreview';
import { createProposal } from '../../actions/proposal';
import { findUser } from '../../actions/user';
import type { TagType } from '../TagInput';

import {
  getTags,
  getIsProposalFetching,
  getProposalErrorMessage,
  getProposalSuccess,
  getVisibleUsers,
  getSessionUser,
} from '../../reducers';
import { isAdmin } from '../../organization';

const messages = defineMessages({
  phaseOnePoll: {
    id: 'proposalManager.phaseOnePoll',
    defaultMessage: 'TR: 25 - PHASE ONE - NO STATEMENTS',
    description: 'PhaseOnePoll presets',
  },
  phaseTwoPoll: {
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
export type ValueType = { name: string, value: any };
export type PollTypeTypes = 'proposed' | 'voting' | 'survey';
type LocalisationShape = {
  de?: string,
  it?: string,
  lld: ?string,
  _default?: string,
};
export type PollSettingsShape = {
  withStatements?: boolean,
  secret?: boolean,
  threshold?: number,
  thresholdRef?: 'all' | 'voters',
  unipolar?: boolean,
};
export type OptionShape = { id: ID, description: LocalisationShape };
type State = {
  ...PollSettingsShape,
  dateTo?: string,
  timeTo?: string,
  body: string,
  title: string,

  spokesman: UserShape,
  pollType: { value: PollTypeTypes, label: string },
  options?: [OptionShape],
  tags: [TagType],
};
type Props = {
  defaultPollType: PollTypeTypes,
  intl: IntlShape,
  user: UserShape,
  createProposal: ({ workTeamId?: ID, ...State }) => Promise<boolean>,
  tags: [TagType],
  users: [UserShape],
  findUser: () => Promise<boolean>,
  workTeamId?: ID,
};

const defaultPollSettings = {
  proposed: {
    withStatements: true,
    unipolar: true,
    threshold: 25,
    secret: false,
    thresholdRef: 'all',
  },
  voting: {
    withStatements: true,
    unipolar: false,
    threshold: 50,
    secret: false,
    thresholdRef: 'voters',
  },
  survey: {
    withStatements: false,
    unipolar: false,
    threshold: 100,
    secret: false,
    thresholdRef: 'voters',
  },
};

class ProposalInput extends React.Component<Props, State> {
  static defaultProps = {
    workTeamId: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      options: [],
      pollType: {
        value: props.defaultPollType || 'proposed',
        label: props.intl.formatMessage({ ...messages.phaseOnePoll }),
      },
      spokesman: props.user,
      tags: [],
      dateTo: '',
      timeTo: '',
      ...defaultPollSettings[props.defaultPollType || 'proposed'],
    };

    this.handleAddOption = this.handleAddOption.bind(this);
    this.handleValueSaving = this.handleValueSaving.bind(this);
    this.handleSubmission = this.handleSubmission.bind(this);
    this.calculateNextStep = this.calculateNextStep.bind(this);
  }

  getNewTags() {
    const { tags: selectedTags } = this.state;

    return selectedTags.map(
      tag =>
        tag.id && tag.id.indexOf(TAG_ID_SUFFIX) !== -1
          ? { text: tag.text }
          : { id: tag.id },
    );
  }

  handleAddOption: OptionShape => void;

  handleValueSaving: ([ValueType]) => void;

  handleSubmission: () => void;

  calculateNextStep: () => void;

  handleAddOption(option: OptionShape) {
    this.setState(({ options }) => ({ options: [...options, option] }));
  }

  handleValueSaving(data) {
    const newData = data.reduce((acc, curr) => {
      acc[curr.name] = curr.value;
      return acc;
    }, {});
    this.setState(newData);
  }

  calculateNextStep({ step, push }) {
    switch (step.id) {
      case 'body': {
        const { pollType } = this.state;
        push(pollType === 'survey' ? 'options' : 'spokesman');
        break;
      }

      default:
        push();
        break;
    }
  }

  handleSubmission() {
    const { createProposal: create, workTeamId } = this.props;
    const startTime = null;
    let endTime = null;
    const {
      dateTo,
      timeTo,
      body,
      title,
      withStatements,
      secret,
      threshold,
      thresholdRef,
      unipolar,
      spokesman,
      pollType,
      options,
    } = this.state;

    if (dateTo || timeTo) {
      const date = dateTo || utcCorrectedDate(3).slice(0, 10);
      const time = timeTo || utcCorrectedDate().slice(11, 16);

      endTime = concatDateAndTime(date, time);
    }

    const newTags = this.getNewTags();

    const spokesmanId = spokesman ? spokesman.id : null;

    create({
      ...(workTeamId && { workTeamId }),
      title: title.trim(),
      text: body,
      state: pollType.value,
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
      tags: newTags,
      spokesmanId,
    });
  }

  render() {
    const {
      options,
      pollType,
      body,
      title,
      spokesman,
      dateTo,
      timeTo,
      tags: selectedTags,
      secret,
      unipolar,
      withStatements,
      threshold,
      thresholdRef,
    } = this.state;
    const { users, user, tags, findUser: fetchUser, intl } = this.props;

    const pollOptions = [
      {
        value: 'proposed',
        label: intl.formatMessage({
          ...messages.phaseOnePoll,
        }),
      },
      {
        value: 'voting',
        label: intl.formatMessage({
          ...messages.phaseTwoPoll,
        }),
      },
      {
        value: 'survey',
        label: intl.formatMessage({
          ...messages.survey,
        }),
      },
    ];
    return (
      <Box column>
        Proposal WIZARD
        <Wizard onNext={this.calculateNextStep} basename="">
          {({ steps, step }) => (
            <StepPage>
              <Meter
                strokeWidth={1}
                percent={((steps.indexOf(step) + 1) / steps.length) * 100}
              />
              <Steps>
                <Step id="poll">
                  <PollType
                    availablePolls={pollOptions}
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
                <Step id="body">
                  <ProposalBody
                    data={{ body, title }}
                    onExit={this.handleValueSaving}
                  />
                </Step>

                <Step id="options">
                  <OptionInput
                    data={options}
                    onExit={this.handleValueSaving}
                    onAddOption={this.handleAddOption}
                  />
                </Step>

                <Step id="spokesman">
                  <SpokesmanInput
                    onExit={this.handleValueSaving}
                    data={spokesman}
                    users={users}
                    onFetchUser={fetchUser}
                  />
                </Step>
                <Step id="date">
                  <DateInput
                    onExit={this.handleValueSaving}
                    data={{ timeTo, dateTo }}
                  />
                </Step>
                <Step id="tags">
                  <TagInput
                    suggestions={tags}
                    selectedTags={selectedTags}
                    maxTags={8}
                    onExit={this.handleValueSaving}
                  />
                </Step>
                <Step id="preview">
                  <InputPreview
                    onExit={this.handleValueSaving}
                    state={pollType.value}
                    spokesman={spokesman}
                    title={title}
                    body={body}
                    onSubmit={this.handleSubmission}
                  />
                </Step>
              </Steps>
            </StepPage>
          )}

          {/* <Navigation /> */}
        </Wizard>
      </Box>
    );
  }
}

const mapStateToProps = state => ({
  tags: getTags(state),
  isPending: getIsProposalFetching(state, '0000'),
  errorMessage: getProposalErrorMessage(state, '0000'),
  success: getProposalSuccess(state, '0000'),
  users: getVisibleUsers(state, 'all'),
  user: getSessionUser(state),
});

const mapDispatch = {
  createProposal,
  findUser,
};

export default connect(
  mapStateToProps,
  mapDispatch,
)(withStyles(s)(injectIntl(ProposalInput)));
