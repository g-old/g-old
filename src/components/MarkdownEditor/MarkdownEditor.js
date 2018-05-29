// @flow
import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import MarkdownIt from 'markdown-it';

import s from './MarkdownEditor.css';
import Box from '../Box';
import Button from '../Button';
import { ICONS } from '../../constants';

type InputValue = { rawInput: string, html: string };
type ChangeEvent = {
  target: { name: string, value: InputValue },
};
type Props = {
  onChange: ChangeEvent => void,
  value: InputValue,
  name: string,
};
type State = {
  selection: [number, number],
};
class MarkdownEditor extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = { selection: [0, 0] };
    this.onStrong = this.onStrong.bind(this);
    this.onItalic = this.onItalic.bind(this);
    this.onAddLink = this.onAddLink.bind(this);
    this.onTextSelect = this.onTextSelect.bind(this);
    this.onTextChange = this.onTextChange.bind(this);
    this.md = new MarkdownIt({
      // html: true,
      linkify: true,
    });
  }
  onStrong: () => void;
  onItalic: () => void;
  onAddLink: () => void;
  onTextSelect: () => void;
  onTextChange: () => void;
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

  onTextSelect(e) {
    this.setState({
      ...this.state,
      selection: [e.target.selectionStart, e.target.selectionEnd],
    });
  }
  onTextChange(e) {
    const { onChange, name } = this.props;
    if (e) {
      const text = e.target.value;
      const newEvent = {
        target: {
          name,
          value: { rawInput: text, html: this.md.render(text) },
        },
      };
      onChange(newEvent);
    }
  }
  isSomethingSelected() {
    return this.state.selection[0] !== this.state.selection[1];
  }

  insertAtSelection(pre, post) {
    let val = this.props.value.rawInput;
    let sel = this.state.selection;
    val = `${val.substring(0, sel[0])}${pre}${val.substring(
      sel[0],
      sel[1],
    )}${post}${val.substring(sel[1])}`;
    sel = [val.length, val.length];
    this.props.onChange({
      target: {
        value: { rawInput: val, html: this.md.render(val) },
        name: this.props.name,
      },
    });
    this.setState({
      selection: sel,
    });
  }

  md: { render: string => string };

  render() {
    const { value, name } = this.props;
    return (
      <React.Fragment>
        <Box pad>
          <Button onClick={this.onStrong} plain icon={<strong>A</strong>} />
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

        <textarea
          className={s.textArea}
          name={name}
          value={value.rawInput}
          onChange={this.onTextChange}
          onSelect={this.onTextSelect}
        />
      </React.Fragment>
    );
  }
}

export default withStyles(s)(MarkdownEditor);
