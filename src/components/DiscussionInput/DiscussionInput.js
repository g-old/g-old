import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/withStyles';
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
import Button from '../Button';
import FormField from '../FormField';

import Box from '../Box';
import Layer from '../Layer';
import Discussion from '../Discussion';
import { ICONS } from '../../constants';
import { nameValidation, createValidator } from '../../core/validation';
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
  visit: {
    id: 'command.visit',
    defaultMessage: 'Visit',
    description: 'Short command to visit something',
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

const formFields = ['title', 'body'];
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
    workteamId: PropTypes.string.isRequired,
    workTeam: PropTypes.shape({}),
    updates: PropTypes.shape({
      success: PropTypes.bool,
      error: PropTypes.bool,
    }),
  };

  static defaultProps = {
    errorMessage: null,
    success: null,
    updates: null,
    workTeam: null,
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

    this.md = new MarkdownIt({
      // html: true,
      linkify: true,
    });

    const testValues = {
      title: { fn: 'name' },
      body: { fn: 'name' },
    };
    this.Validator = createValidator(
      testValues,
      {
        name: nameValidation,
      },
      this,
      obj => obj.state.settings,
    );
  }

  componentWillReceiveProps({ workTeam, updates = {} }) {
    let newUpdates = {};
    if (updates.success && !this.props.updates.success) {
      newUpdates = standardValues;
      newUpdates.success = updates.success;
      newUpdates.error = false;
    }
    if (updates.error && !this.props.updates.error) {
      newUpdates.error = true;
      newUpdates.success = false;
    }

    this.setState({ ...workTeam, ...newUpdates });
  }

  onTextChange(e) {
    this.setState(prevState => {
      return {
        markup: this.md.render(prevState.textArea.val),
        textArea: { ...prevState.textArea, val: e.target.value },
      };
    });
  }

  onTextSelect(e) {
    this.setState({
      textSelection: [e.target.selectionStart, e.target.selectionEnd],
    });
  }

  onTitleChange(e) {
    this.setState({ title: { val: e.target.value } });
  }

  onModeChange(e) {
    this.setState({ value: e.target.value });
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
        workteamId: this.props.workteamId,
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
        value = e.target.value; // eslint-disable-line
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
    const { error } = this.state;
    const { updates = {} } = this.props;
    return (
      <div className={s.root}>
        {/* <Calendar lang={this.props.locale} /> */}
        <Box column pad>
          <FormField label="Title" error={titleError}>
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
            label="Body"
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
          {this.state.showPreview && (
            <Layer
              onClose={() => {
                this.setState({ showPreview: false });
              }}
            >
              <Box tag="article" column pad align padding="medium">
                <Discussion
                  {...{
                    id: '0000',
                    createdAt: new Date(),
                    title:
                      title.trim().length < 3
                        ? 'Title is missing!'
                        : title.trim(),
                    content:
                      this.md.render(body).length < 3
                        ? 'Body is missing'
                        : this.md.render(body),
                  }}
                />
              </Box>
            </Layer>
          )}

          <Box pad>
            <Button
              primary
              label={<FormattedMessage {...messages.submit} />}
              onClick={this.onSubmit}
              disabled={this.props.isPending}
            />
            <Button
              label="Preview"
              onClick={() => {
                this.setState({ showPreview: true });
              }}
            />
          </Box>
          <p>
            {error && <Notification type="error" message={updates.error} />}
          </p>
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
                    history.push(
                      `/workteams/${this.props.workteamId}/discussions/${this.state.success}`,
                    );
                  }}
                  label={<FormattedMessage {...messages.visit} />}
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
export default connect(
  mapStateToProps,
  mapDispatch,
)(withStyles(s)(DiscussionInput));
