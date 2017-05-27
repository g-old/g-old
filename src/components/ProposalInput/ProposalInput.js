import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import MarkdownIt from 'markdown-it';
import cn from 'classnames';
// import Calendar from '../Calendar';
import { createProposal, loadTags } from '../../actions/proposal';
import s from './ProposalInput.css';
import {
  getTags,
  getIsProposalFetching,
  getProposalErrorMessage,
  getProposalSuccess,
} from '../../reducers';
import TagInput from '../TagInput';
import PollInput from '../PollInput';
import { concatDateAndTime, utcCorrectedDate } from '../../core/helpers';

const standardValues = {
  textArea: { val: '', selection: [0, 0] },
  title: { val: '' },
  pollOption: '1',
  settings: {},
  tags: {},
  showInput: false,
  tagId: 'xt0',
  currentTagIds: [],
};
class ProposalInput extends React.Component {
  static propTypes = {
    createProposal: PropTypes.func.isRequired,
    //  intl: PropTypes.shape({}).isRequired,
    //  locale: PropTypes.string.isRequired,
    maxTags: PropTypes.number.isRequired,
    loadTags: PropTypes.func.isRequired,
    isPending: PropTypes.bool.isRequired,
    errorMessage: PropTypes.string,
    success: PropTypes.bool,
    tags: PropTypes.arrayOf(
      PropTypes.shape({
        text: PropTypes.string,
        id: PropTypes.string,
      }),
    ).isRequired,
    defaultPollValues: PropTypes.shape({}).isRequired,
  };

  static defaultProps = {
    errorMessage: null,
    success: false,
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
    this.handleDateTimeChange = this.handleDateTimeChange.bind(this);
    this.handleTagInputChange = this.handleTagInputChange.bind(this);
    this.handleKeys = this.handleKeys.bind(this);
    this.rawMarkup = this.rawMarkup.bind(this);
    this.onStrong = this.onStrong.bind(this);
    this.onItalic = this.onItalic.bind(this);
    this.onAddLink = this.onAddLink.bind(this);
    this.handleValueChanges = this.handleValueChanges.bind(this);
    this.toggleSettings = this.toggleSettings.bind(this);
    this.md = new MarkdownIt({
      // html: true,
      linkify: true,
    });
  }
  componentDidMount() {
    this.props.loadTags();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.success) {
      this.setState({ ...standardValues });
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
      textArea: {
        ...this.state.textArea,
        selection: [e.target.selectionStart, e.target.selectionEnd],
      },
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
    this.insertAtSelection(this.isSomethingSelected() ? '[' : '[link', `](${url})`);
  }

  onTRefChange(e) {
    this.setState({ thresholdRef: e.target.value });
  }

  onSubmit() {
    // TODO validate
    const title = this.state.title.val.trim();
    const markup = this.md.render(this.state.textArea.val); // trim?
    // TODO sanitize input

    let startTime = null;
    let endTime = null;
    let { dateFrom, timeFrom, dateTo, timeTo } = this.state.settings;
    if (dateFrom || timeFrom) {
      dateFrom = dateFrom || new Date();
      timeFrom = timeFrom || utcCorrectedDate().slice(11, 16);
      startTime = concatDateAndTime(dateFrom, timeFrom);
    }
    if (dateTo || timeTo) {
      dateTo = dateTo || new Date();
      timeTo = timeTo || utcCorrectedDate().slice(11, 16);

      endTime = concatDateAndTime(dateTo, timeTo);
    }
    const { withStatements, secret, threshold, thresholdRef, unipolar } = this.state.settings;

    const pollingModeId = this.state.pollOption;

    /* eslint-disable no-confusing-arrow */
    const tags =
      this.state.currentTagIds.map(
        id =>
          this.state.tags[id].id.indexOf('xt') === 0
            ? { text: this.state.tags[id].text }
            : { id: this.state.tags[id].id },
      ) || null;
    /* eslint-enable no-confusing-arrow */
    if (title && markup) {
      this.props.createProposal({
        title,
        text: markup,
        poll: {
          startTime,
          endTime,
          secret,
          threshold: threshold || 20,
          mode: {
            withStatements,
            id: pollingModeId,
            unipolar,
            thresholdRef,
          },
        },
        tags,
      });
    } else if (!title) {
      alert('TITLE MISSING');
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
    this.setState({ settings: { ...this.state.settings, [e.target.name]: value } });
  }
  toggleSettings() {
    this.setState({ displaySettings: !this.state.displaySettings });
  }

  isSomethingSelected() {
    return this.state.textArea.selection[0] !== this.state.textArea.selection[1];
  }
  insertAtSelection(pre, post) {
    let val = this.state.textArea.val;
    let sel = this.state.textArea.selection;
    val = `${val.substring(0, sel[0])}${pre}${val.substring(sel[0], sel[1])}${post}${val.substring(sel[1])}`;
    sel = [val.length, val.length];

    this.setState({
      ...this.state,
      textArea: { val, selection: sel },
    });
  }

  handleDateTimeChange(e) {
    this.setState({ [e.target.name]: e.target.value });
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

  rawMarkup() {
    const rawMarkup = this.md.render(this.state.textArea.val);
    return { __html: rawMarkup };
  }

  render() {
    return (
      <div className={s.root}>
        <div className={s.container}>
          {/* <Calendar lang={this.props.locale} /> */}

          <PollInput
            onValueChange={this.handleValueChanges}
            handleDateChange={this.handleValueChanges}
            selectedPMode={this.state.pollOption}
            displaySettings={this.state.displaySettings}
            defaultPollValues={this.props.defaultPollValues}
            pollValues={this.state.settings}
            toggleSettings={this.toggleSettings}
          />

          <div className={s.formGroup}>
            <label className={s.label} htmlFor="titleinput">
              Titel
            </label>
            <input
              className={s.input}
              name="titleinput"
              type="text"
              value={this.state.title.val}
              onChange={this.onTitleChange}
            />
          </div>
          <div className={s.formGroup}>
            <label className={s.label} htmlFor="textarea">
              Text - you can use Markdown!
            </label>
            <div className={s.editorButtons}>
              <button onClick={this.onStrong}>
                <strong>A</strong>
              </button>
              <button onClick={this.onItalic}>
                <i>A</i>
              </button>
              <button onClick={this.onAddLink}>
                <i className={'fa fa-link'} />
              </button>
            </div>
            <textarea
              className={cn(s.input, s.textInput)}
              name="textarea"
              placeholder="Enter text"
              value={this.state.textArea.val}
              onChange={this.onTextChange}
              onSelect={this.onTextSelect}
            />
          </div>
          <div className={s.formGroup}>
            <label className={s.label} htmlFor="taginput">
              Tags
            </label>
            <TagInput
              name={'taginput'}
              tags={this.state.currentTagIds.map(t => this.state.tags[t])}
              availableTags={Object.keys(this.props.tags).map(t => this.props.tags[t])}
              handleAddition={(t) => {
                if (this.state.currentTagIds.length < this.props.maxTags) {
                  let tag = t;
                  const duplicate = Object.keys(this.props.tags).find(
                    id => this.props.tags[id].text.toLowerCase() === t.text.toLowerCase(),
                  );
                  if (duplicate) {
                    tag = this.props.tags[duplicate];
                  }

                  this.setState({
                    tags: { ...this.state.tags, [tag.id]: tag },
                    currentTagIds: [...new Set([...this.state.currentTagIds, tag.id])],
                  });
                }
              }}
              handleDelete={(id) => {
                this.setState({
                  currentTagIds: this.state.currentTagIds.filter(tId => tId !== id),
                });
              }}
            />
          </div>

          <h2> PREVIEW</h2>
          <div className={s.preview} dangerouslySetInnerHTML={this.rawMarkup()} />

          <div className={s.formGroup}>
            <button className={s.button} onClick={this.onSubmit} disabled={this.isPending}>
              {' '}SUBMIT
            </button>
            {this.props.isPending && <span>{'...submitting'}</span>}
            {this.props.errorMessage && <span>{this.props.errorMessage}</span>}
            {this.props.success && <span>{'Proposal created'}</span>}
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  tags: getTags(state),
  isPending: getIsProposalFetching(state, '0000'),
  errorMessage: getProposalErrorMessage(state, '0000'),
  success: getProposalSuccess(state, '0000'),
});

const mapDispatch = {
  createProposal,
  loadTags,
};
export default connect(mapStateToProps, mapDispatch)(withStyles(s)(ProposalInput));
