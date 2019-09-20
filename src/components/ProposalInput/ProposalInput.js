/* @flow */
import React from 'react';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/withStyles';
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
import ResultPage from './ResultPage';
import Navigation from './Navigation';
import history from '../../history';
import { isHtmlEmpty } from '../MessageInput/validationFns';

import {
  getTags,
  getProposalUpdates,
  getVisibleUsers,
  getSessionUser,
  getLocale,
} from '../../reducers';
import { isAdmin } from '../../organization';

export type Callback = (string, () => boolean) => boolean;
export type ValueType = { name: string, value: any };
export type PollTypeTypes = 'proposed' | 'voting' | 'survey';

export type PollSettingsShape = {
  withStatements?: boolean,
  secret?: boolean,
  threshold?: number,
  thresholdRef?: 'all' | 'voters',
  unipolar?: boolean,
};
type UpdateShape = {
  success?: ID,
  errorMessage?: string,
  pending: boolean,
};

type State = {
  ...PollSettingsShape,
  dateTo?: string,
  timeTo?: string,
  body: string,
  title: string,
  withOptions: boolean,
  spokesman: UserShape,
  pollType: { value: PollTypeTypes, label: string },
  options: OptionShape[],
  tags: TagType[],
};
type Props = {
  defaultPollType: PollTypeTypes,
  user: UserShape,
  createProposal: ({ workTeamId?: ID, ...State }) => Promise<boolean>,
  tags: TagType[],
  users: UserShape[],
  findUser: () => Promise<boolean>,
  workTeamId?: ID,
  defaultPollSettings: { [PollTypeTypes]: PollSettingsShape },
  availablePolls: { [PollTypeTypes]: PollSettingsShape },
  locale: 'de' | 'it' | 'lld',
  updates: UpdateShape,
};

class ProposalInput extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      options: [],
      pollType:
        props.availablePolls.find(
          poll => poll.value === props.defaultPollType,
        ) || props.availablePolls[0],
      spokesman: props.user,
      tags: [],
      dateTo: '',
      timeTo: '',
      withOptions: false,
      ...props.defaultPollSettings[props.defaultPollType || 'proposed'],
    };

    this.storageKey = `proposalDraft${props.workTeamId}`;

    this.handleAddOption = this.handleAddOption.bind(this);
    this.handleValueSaving = this.handleValueSaving.bind(this);
    this.handleSubmission = this.handleSubmission.bind(this);
    this.calculateNextStep = this.calculateNextStep.bind(this);
    this.handleOnSuccess = this.handleOnSuccess.bind(this);
  }

  getNewTags() {
    const { tags: selectedTags } = this.state;

    return selectedTags.map(tag =>
      tag.id && tag.id.indexOf(TAG_ID_SUFFIX) !== -1
        ? { text: tag.text }
        : { id: tag.id },
    );
  }

  handleAddOption: OptionShape => void;

  handleValueSaving: (ValueType[]) => void;

  handleSubmission: () => void;

  calculateNextStep: () => void;

  handleAddOption(option: OptionShape) {
    // add pos to all of them
    this.setState(({ options }) => {
      const newOptions = [...options, option];
      return {
        options: newOptions.map((op, index) => ({ ...op, pos: index })),
      };
    });
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
        const { pollType, withOptions } = this.state;
        push(
          pollType.value === 'survey' && withOptions ? 'options' : 'spokesman',
        );
        break;
      }

      default:
        push();
        break;
    }
  }

  handleSubmission() {
    const { createProposal: create, workTeamId, locale } = this.props;
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
    const extended = !!options.length;
    create({
      ...(workTeamId && { workTeamId }),
      title: title.trim(),
      text: body,
      state: pollType.value,
      poll: {
        options: options.map((o, i) => ({
          ...(isHtmlEmpty(o.description)
            ? {}
            : { description: { [locale]: o.description } }),
          title: { [locale]: o.title },
          pos: i,
          order: i,
        })),
        extended: !!extended,
        multipleChoice: !!extended,
        startTime,
        endTime,
        secret: !!secret,
        threshold,
        mode: {
          withStatements: !!withStatements,
          unipolar: !!unipolar,
          thresholdRef: thresholdRef.value,
        },
      },
      ...(newTags.length ? { tags: newTags } : {}),
      spokesmanId,
    });
    return true;
  }

  reset() {
    const { user, defaultPollType, availablePolls } = this.props;
    this.setState({
      options: [],
      pollType:
        availablePolls.find(poll => poll.value === defaultPollType) ||
        availablePolls[0],
      spokesman: user,
      tags: [],
      dateTo: '',
      timeTo: '',
      title: '',
      secret: false,
      body: '<p></p>',
    });

    localStorage.removeItem(this.storageKey);
  }

  handleOnSuccess() {
    const {
      updates: { success },
    } = this.props;
    if (success) {
      localStorage.removeItem(this.storageKey);
      history.push(`/proposal/${success}`);
    }
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
      withOptions,
    } = this.state;
    const {
      users,
      user,
      tags,
      findUser: fetchUser,
      availablePolls,
      defaultPollSettings,
      updates = {},
      workTeamId,
    } = this.props;
    return (
      <Box column>
        <Wizard onNext={this.calculateNextStep} basename="">
          {({ steps, step, push }) => (
            <StepPage>
              <Meter
                trailWidth={2}
                trailColor="#eee"
                strokeColor="#930793"
                strokeWidth={1}
                percent={((steps.indexOf(step) + 1) / steps.length) * 100}
              />
              <Steps>
                <Step id="poll">
                  <PollType
                    availablePolls={availablePolls}
                    defaultPollSettings={defaultPollSettings}
                    data={{
                      pollType,
                      secret,
                      unipolar,
                      withStatements,
                      threshold,
                      thresholdRef,
                      withOptions,
                    }}
                    onExit={this.handleValueSaving}
                    advancedModeOn={isAdmin(user)}
                  />
                </Step>
                <Step id="body">
                  <ProposalBody
                    storageKey={this.storageKey}
                    data={{ body, title }}
                    onExit={this.handleValueSaving}
                    withOptions={withOptions}
                  />
                </Step>
                <Step id="options">
                  <OptionInput
                    data={options}
                    onExit={this.handleValueSaving}
                    onAddOption={this.handleAddOption}
                    withOptions={withOptions}
                    workTeamId={workTeamId}
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
                    {...this.state}
                    onExit={this.handleValueSaving}
                    state={pollType.value}
                  />
                </Step>
                <Step id="final">
                  <ResultPage
                    success={updates.success}
                    error={updates.errorMessage}
                    onSuccess={this.handleOnSuccess}
                    onRestart={() => {
                      this.reset();
                      push('poll');
                    }}
                  />
                </Step>
              </Steps>
              <Navigation onSubmit={this.handleSubmission} />
            </StepPage>
          )}
        </Wizard>
      </Box>
    );
  }
}

const mapStateToProps = state => ({
  tags: getTags(state),
  updates: getProposalUpdates(state, '0000'),
  users: getVisibleUsers(state, 'all'),
  user: getSessionUser(state),
  locale: getLocale(state).split('-')[0],
});

const mapDispatch = {
  createProposal,
  findUser,
};

export default connect(
  mapStateToProps,
  mapDispatch,
)(withStyles(s)(ProposalInput));
