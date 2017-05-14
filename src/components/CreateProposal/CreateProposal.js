import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import MarkdownIt from 'markdown-it';
import cn from 'classnames';
// import Calendar from '../Calendar';
import { createProposal, loadTags } from '../../actions/proposal';
import s from './CreateProposal.css';
import { getTags } from '../../reducers';
import CheckBox from '../CheckBox';
import TagInput from '../TagInput';

// http://stackoverflow.com/questions/6982692/html5-input-type-date-default-value-to-today
const utcCorrectedDate = (daysAdded) => {
  const local = new Date();
  if (daysAdded) {
    local.setDate(local.getDate() + daysAdded);
  }
  local.setMinutes(local.getMinutes() - local.getTimezoneOffset());
  return local.toJSON();
};

const concatDateAndTime = (date, time) => {
  const d = date || new Date().toJSON().slice(0, 10);
  const t = time || new Date().toJSON().slice(11, 16);
  return new Date(`${d} ${t}`);
};
const DateInput = props => (
  <div>
    <p>
      <label htmlFor="dateFrom">DATE FROM</label>
      <input
        type="date"
        defaultValue={utcCorrectedDate().slice(0, 10)}
        onChange={props.handleChange}
        pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"
        name="dateFrom"
      />
    </p>
    <p>
      <label htmlFor="timeFrom">TIME FROM</label>
      <input
        type="time"
        defaultValue={utcCorrectedDate().slice(11, 16)}
        onChange={props.handleChange}
        name="timeFrom"
      />
    </p>
    <p>
      <label htmlFor="dateTo">DATE TO</label>
      <input
        type="date"
        defaultValue={utcCorrectedDate(3).slice(0, 10)}
        onChange={props.handleChange}
        pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"
        name="dateTo"
      />
    </p>
    <p>
      <label htmlFor="timeTo">TIME TO</label>
      <input type="time" name="timeTo" defaultValue={'12:00'} onChange={props.handleChange} />
    </p>

  </div>
);

DateInput.propTypes = {
  handleChange: PropTypes.func.isRequired,
};

class CreateProposal extends React.Component {
  static propTypes = {
    createProposal: PropTypes.func.isRequired,
    //  intl: PropTypes.shape({}).isRequired,
    //  locale: PropTypes.string.isRequired,
    maxTags: PropTypes.number.isRequired,
    loadTags: PropTypes.func.isRequired,
    tags: PropTypes.arrayOf(
      PropTypes.shape({
        text: PropTypes.string,
        id: PropTypes.string,
      }),
    ).isRequired,
  };
  constructor(props) {
    super(props);

    this.state = {
      textArea: { val: '', selection: [0, 0] },
      title: { val: '' },
      value: 1,
      dateFrom: '',
      dateTo: '',
      timeFrom: '',
      timeTo: '',
      threshold: 20,
      thresholdRef: 'all',
      tags: {},
      showInput: false,
      tagId: 'xt0',
      currentTagIds: [],
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
    this.md = new MarkdownIt({
      // html: true,
      linkify: true,
    });
  }
  componentDidMount() {
    this.props.loadTags();
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
    const { dateFrom, timeFrom, dateTo, timeTo } = this.state;
    if (dateFrom || timeFrom) {
      startTime = concatDateAndTime(dateFrom, timeFrom);
    }

    if (dateTo || timeTo) {
      endTime = concatDateAndTime(dateTo, timeTo);
    }
    const withStatements = this.state.withStatements || false;
    const secret = this.state.secret || false;
    const threshold = this.state.threshold || 20;
    const unipolar = this.state.unipolar;
    const thresholdRef = this.state.thresholdRef || null;

    /* eslint-disable no-confusing-arrow */
    const tags =
      this.state.currentTagIds.map(
        id =>
          this.state.tags[id].id.indexOf('xt') === 0
            ? { text: this.state.tags[id].text }
            : { id: this.state.tags[id].id },
      ) || null;
    /* eslint-enable no-confusing-arrow */
    if ((title && markup) || true) {
      alert('Implement proper sanitizing!');
      this.props.createProposal({
        title,
        text: markup,
        pollingModeId: this.state.value,
        startTime,
        endTime,
        poll: {
          startTime,
          endTime,
          secret,
          threshold,
          mode: {
            withStatements,
            id: this.state.value,
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

          <DateInput handleChange={this.handleDateTimeChange} />
          <div className={s.formGroup}>
            <select onChange={this.onModeChange}>
              <option disabled selected value> -- select a default mode -- </option>
              <option value={1}>TR: 20 UNIPOLAR: NOSTATEMENTS </option>
              <option value={2}>TR: 20 BIPOLAR: WITHSTATEMENTS </option>
            </select>
          </div>
          <CheckBox
            label={'with statements'}
            checked={this.state.withStatements}
            onChange={(e) => {
              this.setState({ withStatements: e.target.checked });
            }}
          />
          <CheckBox
            label={'secret'}
            checked={this.state.secret}
            onChange={(e) => {
              this.setState({ secret: e.target.checked });
            }}
          />
          <CheckBox
            label={'unipolar'}
            checked={this.state.unipolar}
            onChange={(e) => {
              this.setState({ unipolar: e.target.checked });
            }}
          />
          <p>
            Threshold <input
              value={this.state.threshold}
              onChange={(e) => {
                this.setState({ threshold: e.target.value });
              }}
              min={10}
              step={5}
              max={90}
              type="range"
            />
            <label htmlFor="threshold">
              <span name="threshold">{this.state.threshold}</span>
            </label>
          </p>
          <p>
            Threshold Reference: <select onChange={this.onTRefChange}>
              <option value={'all'}>ALL </option>
              <option value={'voters'}>VOTERS</option>
            </select>
          </p>
          <div className={s.formGroup}>
            <label className={s.label} htmlFor="titleinput">
              Titel
            </label>
            <input
              className={s.input}
              name="titleinput"
              type="text"
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
            <button className={s.button} onClick={this.onSubmit}> SUBMIT</button>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  //  intl: getMessages(state),
  //  locale: getLocale(state),
  tags: getTags(state),
});

const mapDispatch = {
  createProposal,
  loadTags,
};
export default connect(mapStateToProps, mapDispatch)(withStyles(s)(CreateProposal));
