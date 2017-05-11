import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import MarkdownIt from 'markdown-it';
import cn from 'classnames';
import { createProposal } from '../../actions/proposal';
import s from './CreateProposal.css';

class CreateProposal extends React.Component {
  static propTypes = {
    createProposal: PropTypes.func.isRequired,
  };
  constructor(props) {
    super(props);
    this.state = { textArea: { val: '', selection: [0, 0] }, title: { val: '' }, value: 1 };
    this.onStrong = this.onStrong.bind(this);
    this.onItalic = this.onItalic.bind(this);
    this.onAddLink = this.onAddLink.bind(this);
    this.onTextChange = this.onTextChange.bind(this);
    this.onTextSelect = this.onTextSelect.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onModeChange = this.onModeChange.bind(this);
    this.onTitleChange = this.onTitleChange.bind(this);
    this.rawMarkup = this.rawMarkup.bind(this);
    this.md = new MarkdownIt({
      // html: true,
      linkify: true,
    });
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

  onSubmit() {
    // TODO validate
    const title = this.state.title.val.trim();
    const markup = this.md.render(this.state.textArea.val); // trim?
    // TODO sanitize input
    if (title && markup) {
      alert('Implement proper sanitizing!');
      this.props.createProposal({ title, text: markup, pollingModeId: this.state.value });
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
  rawMarkup() {
    const rawMarkup = this.md.render(this.state.textArea.val);
    return { __html: rawMarkup };
  }
  render() {
    return (
      <div className={s.root}>
        <div className={s.container}>
          <div className={s.formGroup}>
            <select value={this.state.value} onChange={this.onModeChange}>
              <option value={1}>TR: 20 UNIPOLAR: 1 NOSTATEMENTS </option>
            </select>
          </div>
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
const mapDispatch = {
  createProposal,
};
export default connect(null, mapDispatch)(withStyles(s)(CreateProposal));
