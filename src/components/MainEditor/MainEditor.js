import React from 'react';
// import PropTypes from 'prop-types';
import { Editor } from 'slate-react';
import { Value } from 'slate';

const DEFAULT_NODE = 'paragraph';

class MainEditor extends React.Component {
  static propTypes = {};
  static defaultProps = {};
  constructor(props) {
    super(props);
    this.state = { value: Value.fromJSON({}) };
  }

  onChange = ({ value }) => {
    this.setState({ value });
  };
  onClickMark(event, type) {
    event.preventDefault();
    const { value } = this.state;
    const change = value.change().toggleMark(type);
    this.onChange(change);
  }
  onClickBlock(event, type) {
    event.preventDefault();
    const { value } = this.state;
    const change = value.change();
    const { document } = value;

    // Handle everything but list buttons.
    if (type !== 'bulleted-list' && type !== 'numbered-list') {
      const isActive = this.hasBlock(type);
      const isList = this.hasBlock('list-item');

      if (isList) {
        change
          .setBlocks(isActive ? DEFAULT_NODE : type)
          .unwrapBlock('bulleted-list')
          .unwrapBlock('numbered-list');
      } else {
        change.setBlocks(isActive ? DEFAULT_NODE : type);
      }
    } else {
      // Handle the extra wrapping required for list buttons.
      const isList = this.hasBlock('list-item');
      const isType = value.blocks.some(
        block =>
          !!document.getClosest(block.key, parent => parent.type === type),
      );

      if (isList && isType) {
        change
          .setBlocks(DEFAULT_NODE)
          .unwrapBlock('bulleted-list')
          .unwrapBlock('numbered-list');
      } else if (isList) {
        change
          .unwrapBlock(
            type === 'bulleted-list' ? 'numbered-list' : 'bulleted-list',
          )
          .wrapBlock(type);
      } else {
        change.setBlocks('list-item').wrapBlock(type);
      }
    }

    this.onChange(change);
  }
  hasMark = type => {
    const { value } = this.state;
    return value.activeMarks.some(mark => mark.type === type);
  };
  hasBlock = type => {
    const { value } = this.state;
    return value.blocks.some(node => node.type === type);
  };

  renderToolbar = () => (
    <div className="menu toolbar-menu">
      {this.renderMarkButton('bold', 'format_bold')}
      {this.renderMarkButton('italic', 'format_italic')}
      {this.renderMarkButton('underlined', 'format_underlined')}
      {this.renderMarkButton('code', 'code')}
      {this.renderBlockButton('heading-one', 'looks_one')}
      {this.renderBlockButton('heading-two', 'looks_two')}
      {this.renderBlockButton('block-quote', 'format_quote')}
      {this.renderBlockButton('numbered-list', 'format_list_numbered')}
      {this.renderBlockButton('bulleted-list', 'format_list_bulleted')}
    </div>
  );

  renderMarkButton(type, icon) {
    const isActive = this.hasMark(type);
    const onMouseDown = event => this.onClickMark(event, type);
    /* eslint-disable jsx-a11y/no-static-element-interactions */
    // eslint-disable-next-line react/jsx-no-bind
    return (
      <span className="button" onMouseDown={onMouseDown} data-active={isActive}>
        <span className="material-icons">{icon}</span>
      </span>
    );
    /* eslint-enable jsx-a11y/no-static-element-interactions */
  }

  renderBlockButton(type, icon) {
    let isActive = this.hasBlock(type);

    if (['numbered-list', 'bulleted-list'].includes(type)) {
      const { value } = this.state;
      const parent = value.document.getParent(value.blocks.first().key);
      isActive = this.hasBlock('list-item') && parent && parent.type === type;
    }
    const onMouseDown = event => this.onClickBlock(event, type);
    /* eslint-disable jsx-a11y/no-static-element-interactions */

    // eslint-disable-next-line react/jsx-no-bind
    return (
      <span className="button" onMouseDown={onMouseDown} data-active={isActive}>
        <span className="material-icons">{icon}</span>
      </span>
    );
    /* eslint-enable jsx-a11y/no-static-element-interactions */
  }
  renderEditor() {
    return (
      <div className="editor">
        <Editor
          placeholder="Enter some rich text..."
          value={this.state.value}
          onChange={this.onChange}
          onKeyDown={this.onKeyDown}
          renderNode={this.renderNode}
          renderMark={this.renderMark}
          spellCheck
          autoFocus
        />
      </div>
    );
  }

  render() {
    return (
      <div>
        {this.renderToolbar()}
        {this.renderEditor()}
      </div>
    );
  }
}

export default MainEditor;
