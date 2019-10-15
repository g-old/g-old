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
// import PollType from './PollType';
import ProposalBody from './ProposalBody';
import DateInput from './DateInput';
import TagInput, { TAG_ID_SUFFIX } from './TagInput';
import InputPreview from './InputPreview';
import FileUpload from './Uploader';
import { createProposal } from '../../actions/proposal';
import { uploadFiles } from '../../actions/file';
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
  getUploadStatus,
} from '../../reducers';

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
  files: File[],
  cropCoordinates: {},
  scale: number,
  rotation: number,
  summary: string,
  previewImage: mixed,
};
type Props = {
  defaultPollType: PollTypeTypes,
  user: UserShape,
  title?: string,
  body?: string,
  image?: string,
  createProposal: ({ workTeamId?: ID, ...State }) => Promise<boolean>,
  tags: TagType[],
  users: UserShape[],
  findUser: () => Promise<boolean>,
  workTeamId?: ID,
  defaultPollSettings: { [PollTypeTypes]: PollSettingsShape },
  availablePolls: { [PollTypeTypes]: PollSettingsShape },
  locale: 'de' | 'it' | 'lld',
  updates: UpdateShape,
  uploadFiles: () => void,
  uploadStatus?: { pending?: boolean, error?: string },
};
const DEFAULT_POLL_TYPE = 'voting';

class ProposalInput extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      options: [],
      pollType: props.availablePolls
        ? props.availablePolls.find(
            poll => poll.value === props.defaultPollType,
          ) || props.availablePolls[0]
        : DEFAULT_POLL_TYPE,
      spokesman: props.user,
      tags: [],
      dateTo: '',
      timeTo: '',
      withOptions: false,
      cropCoordinates: null,
      title: props.title,
      body: props.body,
      image: props.image,
      scale: 1,
      state: props.defaultPollType || DEFAULT_POLL_TYPE,
      rotation: 0,
      transferRights: false,
      ...(props.defaultPollSettings &&
        props.defaultPollSettings[props.defaultPollType || DEFAULT_POLL_TYPE]),
    };

    this.storageKey = `proposalDraft${props.workTeamId || '-public'}`;

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

  calculateNextStep({ push }) {
    push();
    /* switch (step.id) {
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
    } */
  }

  handleSubmission() {
    const { createProposal: create, workTeamId, locale, image } = this.props;
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
      files,
      cropCoordinates,
      scale,
      rotation,
      summary,
    } = this.state;

    if (dateTo || timeTo) {
      const date = dateTo || utcCorrectedDate(3).slice(0, 10);
      const time = timeTo || utcCorrectedDate().slice(11, 16);

      endTime = concatDateAndTime(date, time);
    }

    const newTags = this.getNewTags();
    const spokesmanId = spokesman ? spokesman.id : null;
    const extended = !!options.length;
    const proposalProps = {
      ...(workTeamId && { workTeamId }),
      title: title.trim(),
      summary: summary && summary.trim(),
      text: body,
      state: pollType.value,
      ...(image && { image }),

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
    };
    if (files) {
      // send file
      return this.props
        .uploadFiles(files, { scale, cropCoordinates, rotation })
        .then(result => {
          if (result) {
            create({
              ...proposalProps,
              ...(result.length && { image: result[0] }),
            });
          }
        });
    }
    return create(proposalProps);
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
      summary: '',
      secret: false,
      body: '<p></p>',
      cropCoordinates: null,
      files: null,
      scale: 1,
      rotation: 0,
      transferRights: false,
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
      pollType,
      body,
      title,
      summary,
      tags: selectedTags,
      withOptions,
      files,
      dateTo,
      timeTo,
      cropCoordinates,
      previewImage,
      scale,
      rotation,
      transferRights,
    } = this.state;
    const { tags, updates = {}, image, uploadStatus } = this.props;
    return (
      <Box fill column>
        <Wizard onNext={this.calculateNextStep} basename="">
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
                <Step id="body">
                  <ProposalBody
                    storageKey={this.storageKey}
                    data={{ body, title, summary }}
                    onExit={this.handleValueSaving}
                    withOptions={withOptions}
                  />
                </Step>
                {!image && (
                  <Step id="file">
                    <FileUpload
                      data={{
                        files,
                        cropCoordinates,
                        scale,
                        rotation,
                        transferRights,
                      }}
                      onExit={this.handleValueSaving}
                    />
                  </Step>
                )}
                <Step id="date">
                  <DateInput
                    data={{ dateTo, timeTo }}
                    onExit={this.handleValueSaving}
                  />
                </Step>

                <Step id="tags">
                  <TagInput
                    suggestions={tags}
                    selectedTags={selectedTags}
                    maxTags={5}
                    onExit={this.handleValueSaving}
                  />
                </Step>
                <Step id="preview">
                  <InputPreview
                    {...this.state}
                    image={image}
                    onExit={this.handleValueSaving}
                    state={pollType.value}
                  />
                </Step>
                <Step id="final">
                  <ResultPage
                    success={updates.success}
                    error={
                      (uploadStatus && uploadStatus.error) ||
                      updates.errorMessage
                    }
                    onSuccess={this.handleOnSuccess}
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
  uploadStatus: getUploadStatus(state),
});

const mapDispatch = {
  createProposal,
  findUser,
  uploadFiles,
};

export default connect(
  mapStateToProps,
  mapDispatch,
)(withStyles(s)(ProposalInput));
