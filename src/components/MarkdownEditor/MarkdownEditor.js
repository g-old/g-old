// @flow
import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './MarkdownEditor.css';
import Box from '../Box';
import Button from '../Button';
import { ICONS } from '../../constants';

type Props = {
  onChange: () => { target: { name: string, value: string } },
  value: string,
  name: string,
};
type State = {
  selection: [number, number],
};
class MarkdownEditor extends React.Component<Props, State> {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = { selection: [0, 0] };
    this.onStrong = this.onStrong.bind(this);
    this.onItalic = this.onItalic.bind(this);
    this.onAddLink = this.onAddLink.bind(this);
    this.onTextSelect = this.onTextSelect.bind(this);
  }
  onStrong: () => void;
  onItalic: () => void;
  onAddLink: () => void;
  onTextSelect: () => void;

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
  isSomethingSelected() {
    return this.state.selection[0] !== this.state.selection[1];
  }

  insertAtSelection(pre, post) {
    let val = this.props.value;
    let sel = this.state.selection;
    val = `${val.substring(0, sel[0])}${pre}${val.substring(
      sel[0],
      sel[1],
    )}${post}${val.substring(sel[1])}`;
    sel = [val.length, val.length];
    this.props.onChange({ target: { value: val, name: this.props.name } });
    this.setState({
      selection: sel,
    });
  }

  render() {
    const { value, onChange, name } = this.props;
    return (
      <Box column>
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
          value={value}
          onChange={onChange}
          onSelect={this.onTextSelect}
        />
      </Box>
    );
  }
}

export default withStyles(s)(MarkdownEditor);
