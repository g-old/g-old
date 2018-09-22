import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import MarkdownIt from 'markdown-it';
import { defineMessages, FormattedMessage } from 'react-intl';
import MainEditor from '../MainEditor';

// import Calendar from '../Calendar';
import { createProposal } from '../../actions/proposal';
import { findUser } from '../../actions/user';
import s from './ProposalInput.css';
import {
  getTags,
  getIsProposalFetching,
  getProposalErrorMessage,
  getProposalSuccess,
  getVisibleUsers,
} from '../../reducers';
import TagInput from '../TagInput';
import PollInput from '../PollInput';
import { concatDateAndTime, utcCorrectedDate } from '../../core/helpers';
import Button from '../Button';
import FormField from '../FormField';
import Box from '../Box';
import PreviewLayer from './PreviewLayer';
import OptionInput from './OptionInput';
// import { ICONS } from '../../constants';
import {
  nameValidation,
  createValidator,
  dateToValidation,
  timeToValidation,
  selectValidation,
} from '../../core/validation';
import Notification from '../Notification';
import history from '../../history';
import SearchField from '../SearchField';

const messages = defineMessages({
  empty: {
    id: 'form.error-empty',
    defaultMessage: "You can't leave this empty",
    description: 'Help for empty fields',
  },
  wrongSelect: {
    id: 'form.error-select',
    defaultMessage: 'You selection is not correct. Click on a suggestion',
    description:
      'Help for selection, when input does not match with a suggestion',
  },
  past: {
    id: 'form.error-past',
    defaultMessage: 'Time already passed',
    description: 'Help for wrong time settings',
  },
  success: {
    id: 'notification.success',
    defaultMessage: 'Success!',
    description: 'Should notify a successful action',
  },
  submit: {
    id: 'command.submit',
    defaultMessage: 'Submit',
    description: 'Short command for sending data to the server',
  },
});

const standardValues = {
  textArea: { val: '', selection: [0, 0] },
  settings: {
    pollOption: { value: '1' },
    title: '',
    body: '',
    spokesman: null,
  },
  tags: {},
  showInput: false,
  tagId: 'xt0',
  currentTagIds: [],
  spokesmanValue: undefined,
  clearSpokesman: false,
  options: [],
  errors: {
    title: {
      touched: false,
    },
    body: {
      touched: false,
    },
    dateTo: {
      touched: false,
    },
    timeTo: {
      touched: false,
    },
    spokesman: {
      touched: false,
    },
  },
};

const formFields = ['title', 'body', 'dateTo', 'timeTo', 'spokesman'];
class ProposalInput extends React.Component {
  static propTypes = {
    createProposal: PropTypes.func.isRequired,
    //  intl: PropTypes.shape({}).isRequired,
    //  locale: PropTypes.string.isRequired,
    maxTags: PropTypes.number.isRequired,
    isPending: PropTypes.bool,
    errorMessage: PropTypes.string,
    success: PropTypes.string,
    tags: PropTypes.arrayOf(
      PropTypes.shape({
        text: PropTypes.string,
        id: PropTypes.string,
      }),
    ).isRequired,
    defaultPollValues: PropTypes.shape({}).isRequired,
    pollOptions: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    userArray: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    findUser: PropTypes.func.isRequired,
    workTeamId: PropTypes.string.isRequired,
  };

  static defaultProps = {
    isPending: false,
    errorMessage: null,
    success: null,
  };

  constructor(props) {
    super(props);

    this.state = {
      ...standardValues,
    };
    this.storageKey = 'ProposalContent';
    this.onTextChange = this.onTextChange.bind(this);
    this.onTextSelect = this.onTextSelect.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.handleTagInputChange = this.handleTagInputChange.bind(this);
    this.handleKeys = this.handleKeys.bind(this);
    this.onStrong = this.onStrong.bind(this);
    this.onItalic = this.onItalic.bind(this);
    this.onAddLink = this.onAddLink.bind(this);
    this.handleValueChanges = this.handleValueChanges.bind(this);
    this.toggleSettings = this.toggleSettings.bind(this);
    this.handleValidation = this.handleValidation.bind(this);
    this.visibleErrors = this.visibleErrors.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleSpokesmanValueChange = this.handleSpokesmanValueChange.bind(
      this,
    );

    this.handleAddTag = this.handleAddTag.bind(this);
    this.handleRemoveTag = this.handleRemoveTag.bind(this);
    this.togglePreview = this.togglePreview.bind(this);
    this.handleAddOption = this.handleAddOption.bind(this);
    this.md = new MarkdownIt({
      // html: true,
      linkify: true,
    });

    const testValues = {
      title: { fn: 'name' },
      body: { fn: 'name' },
      dateTo: { fn: 'date' },
      timeTo: { fn: 'time' },
      spokesman: {
        fn: 'spokesman',
        valuesResolver: obj => obj.state.spokesmanValue,
      },
    };
    this.Validator = createValidator(
      testValues,
      {
        name: nameValidation,
        date: dateToValidation,
        time: timeToValidation,
        spokesman: selectValidation,
      },
      this,
      obj => obj.state.settings,
    );
  }

  componentDidMount() {
    const initialValue = localStorage.getItem(this.storageKey) || '<p></p>';
    this.editor.setInitialState(initialValue);
  }

  componentWillReceiveProps({ success, errorMessage }) {
    const { success: oldSuccess, errorMessage: oldErrorMessage } = this.props;
    if (success) {
      if (!oldSuccess) {
        this.setState({
          ...standardValues,
          success: true,
          clearSpokesman: true,
        });
        this.resetEditor();
        localStorage.setItem(this.storageKey, '<p></p>');
      } /* else if (!this.state.success) {
        this.setState({
          ...standardValues,
          success: false,
          clearSpokesman: false,
        });
      } */
    }
    if (errorMessage) {
      this.setState({ error: !oldErrorMessage });
    }
    //
  }

  onTextChange(e) {
    const { textArea } = this.state;
    const html = this.md.render(textArea.val);

    this.setState(prevState => ({
      markup: html,
      textArea: {
        ...prevState.textArea,
        val: e.target.value,
      },
    }));
  }

  onTextSelect(e) {
    this.setState({
      textSelection: [e.target.selectionStart, e.target.selectionEnd],
    });
  }

  onStrong() {
    if (this.isSomethingSelected()) this.insertAtSelection('****', '****');
  }

  onItalic() {
    if (this.isSomethingSelected()) this.insertAtSelection('*', '*');
  }

  onAddLink() {
    const url = prompt('URL', 'https://');
    if (url) {
      this.insertAtSelection(
        this.isSomethingSelected() ? '[' : '[link',
        `](${url})`,
      );
    }
  }

  onSubmit() {
    // TODO validate
    if (this.handleValidation(formFields)) {
      const { settings, currentTagIds, tags, options } = this.state;
      const startTime = null;
      let endTime = null;
      const { dateTo, timeTo, body, title, pollOption } = settings;
      // currently not in use
      /*  if (dateFrom || timeFrom) {
        dateFrom = dateFrom || new Date();
        timeFrom = timeFrom || utcCorrectedDate().slice(11, 16);
        startTime = concatDateAndTime(dateFrom, timeFrom);
      }
      */
      if (dateTo || timeTo) {
        const date = dateTo || utcCorrectedDate(3).slice(0, 10);
        const time = timeTo || utcCorrectedDate().slice(11, 16);

        endTime = concatDateAndTime(date, time);
      }
      const {
        withStatements,
        secret,
        threshold,
        thresholdRef,
        unipolar,
        spokesman,
      } = settings;
      const {
        createProposal: create,
        workTeamId,
        defaultPollValues,
      } = this.props;

      /* eslint-disable no-confusing-arrow */
      const newTags =
        currentTagIds.map(
          id =>
            tags[id].id.indexOf('xt') === 0
              ? { text: tags[id].text }
              : { id: tags[id].id },
        ) || null;
      /* eslint-enable no-confusing-arrow */
      let state;
      if (pollOption.value === '3') {
        state = 'survey';
      } else {
        state = pollOption.value === '2' ? 'voting' : 'proposed';
      }

      const spokesmanId = spokesman ? spokesman.id : null;
      create({
        ...(workTeamId && { workTeamId }),
        title: title.trim(),
        text: body,
        state,
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
          threshold: threshold || defaultPollValues[pollOption.value].threshold,
          mode: {
            withStatements:
              withStatements === undefined
                ? defaultPollValues[pollOption.value].withStatements
                : withStatements,
            id: pollOption.value,
            unipolar,
            thresholdRef,
          },
        },
        tags: newTags,
        spokesmanId,
      });
    }
  }

  resetEditor() {
    this.editor.reset();
  }

  handleSpokesmanValueChange(e) {
    alert('NOT WORKING');
    this.setState({ spokesmanValue: e.value }); // eslint-disable-line
  }

  visibleErrors(errorNames) {
    const { errors } = this.state;
    return errorNames.reduce((acc, curr) => {
      const err = `${curr}Error`;
      if (errors[curr].touched) {
        acc[err] = <FormattedMessage {...messages[errors[curr].errorName]} />;
      }
      return acc;
    }, {});
  }

  handleValidation(fields) {
    const { errors } = this.state;
    const validated = this.Validator(fields);
    this.setState({ errors: { ...errors, ...validated.errors } });
    return validated.failed === 0;
  }

  handleBlur(e) {
    const field = e.target.name;
    const { settings } = this.state;
    if (settings[field]) {
      this.handleValidation([field]);
    }
  }

  handleValueChanges(e) {
    let value;
    switch (e.target.name) {
      case 'dateTo':
      case 'dateFrom':
      case 'timeFrom':
      case 'timeTo':
      case 'threshold':
      case 'thresholdRef':
      case 'tagInput':
      case 'title':
      case 'body':
      case 'spokesman':
      case 'pollOption': {
        ({ value } = e.target);
        break;
      }
      case 'withStatements':
      case 'unipolar':
      case 'secret': {
        value = e.target.checked;
        break;
      }

      default:
        throw Error(`Element not recognized: ${e.target.name}`);
    }
    this.setState({
      settings: { [e.target.name]: value },
    });
  }

  toggleSettings() {
    this.setState(prevState => ({ showSettings: !prevState.showSettings }));
  }

  isSomethingSelected() {
    const { textSelection } = this.state;
    return textSelection[0] !== textSelection[1];
  }

  insertAtSelection(pre, post) {
    const { settings, textSelection } = this.state;
    let val = settings.body;
    let sel = textSelection;
    val = `${val.substring(0, sel[0])}${pre}${val.substring(
      sel[0],
      sel[1],
    )}${post}${val.substring(sel[1])}`;
    sel = [val.length, val.length];

    this.setState(prevState => ({
      settings: {
        ...prevState.settings,
        body: val,
      },
      textSelection: sel,
    }));
  }

  handleTagInputChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  handleKeys(e) {
    if (e.key === 'Enter') {
      const { tagInput } = this.state;
      if (tagInput) {
        this.setState(prevState => ({
          tags: { ...prevState.tags, [prevState.tagId]: prevState.tagInput },
          showInput: false,
        }));
      }
    }
  }

  handleAddTag(tag) {
    const { maxTags, tags } = this.props;
    const { currentTagIds } = this.state;
    let newTag = tag;
    if (currentTagIds.length < maxTags) {
      const duplicate = Object.keys(tags).find(
        id => tags[id].text.toLowerCase() === newTag.text.toLowerCase(),
      );
      if (duplicate) {
        newTag = tags[duplicate];
      }

      this.setState(prevState => ({
        tags: { ...tags, [tag.id]: tag },
        currentTagIds: [...new Set([...prevState.currentTagIds, newTag.id])],
      }));
    }
  }

  handleRemoveTag(tagId) {
    this.setState(prevState => ({
      currentTagIds: prevState.currentTagIds.filter(tId => tId !== tagId),
    }));
  }

  togglePreview() {
    this.setState(prevState => ({ showPreview: !prevState.showPreview }));
  }

  handleAddOption(newOption) {
    this.setState(prevState => ({
      options: [...prevState.options, newOption],
    }));
  }

  render() {
    const {
      defaultPollValues,
      pollOptions,
      tags: availableTags,
      userArray,
      findUser: fetchUser,
      success,
      errorMessage,
      isPending,
    } = this.props;
    const {
      showSettings,
      settings,
      initialValue,
      currentTagIds,
      tags,
      clearSpokesman,
      showPreview,
      options,
      success: successState,
      error: errorState,
    } = this.state;
    const { title, body, spokesman, pollOption } = settings;
    const {
      titleError,
      bodyError,
      spokesmanError,
      ...pollErrors
    } = this.visibleErrors(formFields);
    const showOptionInput = pollOption.value === '3';
    return (
      <div className={s.root}>
        <Box column pad>
          {/* <Calendar lang={this.props.locale} /> */}

          <div>
            <PollInput
              onValueChange={this.handleValueChanges}
              handleDateChange={this.handleValueChanges}
              selectedPMode={pollOption}
              showSettings={showSettings}
              defaultPollValues={defaultPollValues}
              pollValues={settings}
              toggleSettings={this.toggleSettings}
              pollOptions={pollOptions}
              intl={this.context.intl} // eslint-disable-line
              formErrors={pollErrors}
              handleBlur={this.handleBlur}
            />
            <FormField label="Title" error={titleError}>
              <input
                name="title"
                onBlur={this.handleBlur}
                type="text"
                value={title}
                onChange={this.handleValueChanges}
              />
            </FormField>
            <FormField error={bodyError} label="Body">
              <MainEditor
                ref={
                  elm => (this.editor = elm) // eslint-disable-line
                }
                initialValue={initialValue}
                className={s.editor}
                value={body}
                onChange={value => {
                  this.handleValueChanges({
                    target: { name: 'body', value },
                  });
                  localStorage.setItem(this.storageKey, value);
                }}
              />

              {/*  <Button onClick={this.onStrong} plain icon={<strong>
                        A
                      </strong>} />
                  <Button onClick={this.onItalic} plain icon={<i>A</i>} />
                  <Button plain onClick={this.onAddLink} icon={<svg viewBox="0 0 24 24" width="24px" height="24px" role="img" aria-label="link">
                        <path fill="none" stroke="#000" strokeWidth="2" d={ICONS.link} />
                      </svg>} />
                </Box>}>

              <textarea
                className={s.textInput}
                name="body"
                value={body}
                onChange={this.handleValueChanges}
                onSelect={this.onTextSelect}
                onBlur={this.handleBlur}
              /> */}
            </FormField>
            {showOptionInput && (
              <FormField label="Options">
                <OptionInput
                  options={options}
                  onAddOption={this.handleAddOption}
                />
              </FormField>
            )}

            <FormField label="Tags">
              <TagInput
                name="tagInput"
                tags={currentTagIds.map(t => tags[t])}
                availableTags={Object.keys(availableTags).map(
                  t => availableTags[t],
                )}
                handleAddition={this.handleAddTag}
                handleDelete={this.handleRemoveTag}
              />
            </FormField>
            <FormField overflow label="Spokesman" error={spokesmanError}>
              <SearchField
                onChange={this.handleSpokesmanValueChange}
                data={userArray}
                fetch={fetchUser}
                clear={clearSpokesman}
                displaySelected={data => {
                  this.setState(prevState => ({
                    settings: { ...prevState.settings, spokesman: data },
                  }));
                }}
              />
            </FormField>
          </div>
          {showPreview && (
            <PreviewLayer
              state={pollOption.value === '3' ? 'survey' : 'proposed'}
              title={title}
              body={body}
              spokesman={spokesman}
              onClose={this.togglePreview}
            />
          )}

          <Box pad>
            <Button
              primary
              label={<FormattedMessage {...messages.submit} />}
              onClick={this.onSubmit}
              disabled={this.isPending}
            />
            <Button label="Preview" onClick={this.togglePreview} />
          </Box>

          {isPending && <span>...submitting</span>}
          {errorState && <Notification type="error" message={errorMessage} />}
          {successState && (
            <Notification
              type="success"
              message={<FormattedMessage {...messages.success} />}
              action={
                <Button
                  plain
                  reverse
                  icon={
                    <svg
                      viewBox="0 0 24 24"
                      width="24px"
                      height="24px"
                      role="img"
                    >
                      <path
                        fill="none"
                        stroke="#000"
                        strokeWidth="2"
                        d="M2,12 L22,12 M13,3 L22,12 L13,21"
                      />
                    </svg>
                  }
                  onClick={() => {
                    history.push(`/proposal/${success}`);
                  }}
                  label="Visit"
                />
              }
            />
          )}
        </Box>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  tags: getTags(state),
  isPending: getIsProposalFetching(state, '0000'),
  errorMessage: getProposalErrorMessage(state, '0000'),
  success: getProposalSuccess(state, '0000'),
  userArray: getVisibleUsers(state, 'all'),
});

const mapDispatch = {
  createProposal,
  findUser,
};
ProposalInput.contextTypes = {
  intl: PropTypes.shape({}),
};
export default connect(
  mapStateToProps,
  mapDispatch,
)(withStyles(s)(ProposalInput));
