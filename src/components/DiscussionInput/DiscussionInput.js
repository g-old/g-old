import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import MarkdownIt from 'markdown-it';
import { defineMessages, FormattedMessage } from 'react-intl';

// import Calendar from '../Calendar';
import { createDiscussion } from '../../actions/discussion';
import s from './DiscussionInput.css';
import {
  getTags,
  getIsDiscussionFetching,
  getDiscussionError,
} from '../../reducers';
import TagInput from '../TagInput';
import Button from '../Button';
import FormField from '../FormField';
import Box from '../Box';
import Layer from '../Layer';
import Discussion from '../Discussion';
import { ICONS } from '../../constants';
import {
  nameValidation,
  createValidator,
  dateToValidation,
  timeToValidation,
  selectValidation,
} from '../../core/validation';
import Notification from '../Notification';
import history from '../../history';

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
class DiscussionInput extends React.Component {
  static propTypes = {
    createDiscussion: PropTypes.func.isRequired,
    //  intl: PropTypes.shape({}).isRequired,
    //  locale: PropTypes.string.isRequired,
    maxTags: PropTypes.number.isRequired,
    isPending: PropTypes.bool.isRequired,
    errorMessage: PropTypes.string,
    success: PropTypes.string,
    tags: PropTypes.arrayOf(
      PropTypes.shape({
        text: PropTypes.string,
        id: PropTypes.string,
      }),
    ).isRequired,
    workTeamId: PropTypes.string.isRequired,
  };

  static defaultProps = {
    errorMessage: null,
    success: null,
  };

  constructor(props) {
    super(props);

    this.state = {
      ...standardValues,
    };
    this.onTextChange = this.onTextChange.bind(this);
    this.onTextSelect = this.onTextSelect.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onModeChange = this.onModeChange.bind(this);
    this.onTRefChange = this.onTRefChange.bind(this);
    this.onTitleChange = this.onTitleChange.bind(this);
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

  componentWillReceiveProps({ success, errorMessage }) {
    if (success) {
      if (!this.props.success) {
        this.setState({
          ...standardValues,
          success: true,
          clearSpokesman: true,
        });
      } /* else if (!this.state.success) {
        this.setState({
          ...standardValues,
          success: false,
          clearSpokesman: false,
        });
      } */
    }
    if (errorMessage) {
      this.setState({ error: !this.props.errorMessage });
    }
  }

  onTextChange(e) {
    const html = this.md.render(this.state.textArea.val);

    this.setState({
      ...this.state,
      markup: html,
      textArea: {
        ...this.state.textArea,
        val: e.target.value,
      },
    });
  }
  onTextSelect(e) {
    this.setState({
      ...this.state,
      textSelection: [e.target.selectionStart, e.target.selectionEnd],
    });
  }
  onTitleChange(e) {
    this.setState({ ...this.state, title: { val: e.target.value } });
  }
  onModeChange(e) {
    this.setState({ ...this.state, value: e.target.value });
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

  onTRefChange(e) {
    this.setState({ thresholdRef: e.target.value });
  }

  onSubmit() {
    // TODO validate
    if (this.handleValidation(formFields)) {
      const { body, title } = this.state.settings;

      this.props.createDiscussion({
        title: title.trim(),
        content: this.md.render(body),
        workTeamId: this.props.workTeamId,
      });
    }
  }

  handleSpokesmanValueChange(e) {
    this.setState({ spokesmanValue: e.value });
  }

  visibleErrors(errorNames) {
    return errorNames.reduce((acc, curr) => {
      const err = `${curr}Error`;
      if (this.state.errors[curr].touched) {
        acc[err] = (
          <FormattedMessage {...messages[this.state.errors[curr].errorName]} />
        );
      }
      return acc;
    }, {});
  }

  handleValidation(fields) {
    const validated = this.Validator(fields);
    this.setState({ errors: { ...this.state.errors, ...validated.errors } });
    return validated.failed === 0;
  }
  handleBlur(e) {
    const field = e.target.name;
    if (this.state.settings[field]) {
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
        value = e.target.value;
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
      settings: { ...this.state.settings, [e.target.name]: value },
    });
  }
  toggleSettings() {
    this.setState({ displaySettings: !this.state.displaySettings });
  }

  isSomethingSelected() {
    return this.state.textSelection[0] !== this.state.textSelection[1];
  }
  insertAtSelection(pre, post) {
    let val = this.state.settings.body;
    let sel = this.state.textSelection;
    val = `${val.substring(0, sel[0])}${pre}${val.substring(
      sel[0],
      sel[1],
    )}${post}${val.substring(sel[1])}`;
    sel = [val.length, val.length];

    this.setState({
      ...this.state,
      settings: {
        ...this.state.settings,
        body: val,
      },
      textSelection: sel,
    });
  }

  handleTagInputChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }
  handleKeys(e) {
    if (e.key === 'Enter') {
      if (this.state.tagInput) {
        this.setState({
          tags: { ...this.state.tags, [this.state.tagId]: this.state.tagInput },
          showInput: false,
        });
      }
    }
  }

  render() {
    const { title, body } = this.state.settings;
    const { titleError, bodyError } = this.visibleErrors(formFields);
    return (
      <div className={s.root}>
        <Box column pad>
          {/* <Calendar lang={this.props.locale} /> */}

          <div>
            <FormField label={'Title'} error={titleError}>
              <input
                name="title"
                onBlur={this.handleBlur}
                type="text"
                value={title}
                onChange={this.handleValueChanges}
              />
            </FormField>
            <FormField
              error={bodyError}
              label={'Body'}
              help={
                <Box pad>
                  <Button
                    onClick={this.onStrong}
                    plain
                    icon={<strong>A</strong>}
                  />
                  <Button onClick={this.onItalic} plain icon={<i>A</i>} />
                  <Button
                    plain
                    onClick={this.onAddLink}
                    icon={
                      <svg
                        viewBox="0 0 24 24"
                        width="24px"
                        height="24px"
                        role="img"
                        aria-label="link"
                      >
                        <path
                          fill="none"
                          stroke="#000"
                          strokeWidth="2"
                          d={ICONS.link}
                        />
                      </svg>
                    }
                  />
                </Box>
              }
            >
              <textarea
                className={s.textInput}
                name="body"
                value={body}
                onChange={this.handleValueChanges}
                onSelect={this.onTextSelect}
                onBlur={this.handleBlur}
              />
            </FormField>

            <FormField label="Tags">
              <TagInput
                name={'tagInput'}
                tags={this.state.currentTagIds.map(t => this.state.tags[t])}
                availableTags={Object.keys(this.props.tags).map(
                  t => this.props.tags[t],
                )}
                handleAddition={t => {
                  if (this.state.currentTagIds.length < this.props.maxTags) {
                    let tag = t;
                    const duplicate = Object.keys(this.props.tags).find(
                      id =>
                        this.props.tags[id].text.toLowerCase() ===
                        t.text.toLowerCase(),
                    );
                    if (duplicate) {
                      tag = this.props.tags[duplicate];
                    }

                    this.setState({
                      tags: { ...this.state.tags, [tag.id]: tag },
                      currentTagIds: [
                        ...new Set([...this.state.currentTagIds, tag.id]),
                      ],
                    });
                  }
                }}
                handleDelete={id => {
                  this.setState({
                    currentTagIds: this.state.currentTagIds.filter(
                      tId => tId !== id,
                    ),
                  });
                }}
              />
            </FormField>
          </div>
          {this.state.showPreview && (
            <Layer
              onClose={() => {
                this.setState({ showPreview: false });
              }}
            >
              <Discussion
                {...{
                  id: '0000',

                  title:
                    title.trim().length < 3
                      ? 'Title is missing!'
                      : title.trim(),
                  body:
                    this.md.render(body).length < 3
                      ? 'Body is missing'
                      : this.md.render(body),
                }}
              />
            </Layer>
          )}

          <Box pad>
            <Button
              primary
              label={<FormattedMessage {...messages.submit} />}
              onClick={this.onSubmit}
              disabled={this.isPending}
            />
            <Button
              label="Preview"
              onClick={() => {
                this.setState({ showPreview: true });
              }}
            />
          </Box>
          {this.props.isPending && <span>{'...submitting'}</span>}
          {this.state.error && (
            <Notification type="error" message={this.props.errorMessage} />
          )}
          {this.state.success && (
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
                    history.push(`/proposal/${this.props.success}`);
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
  isPending: getIsDiscussionFetching(state, '0000'),
  errorMessage: getDiscussionError(state, '0000'),
});

const mapDispatch = {
  createDiscussion,
};
DiscussionInput.contextTypes = {
  intl: PropTypes.object,
};
export default connect(mapStateToProps, mapDispatch)(
  withStyles(s)(DiscussionInput),
);
