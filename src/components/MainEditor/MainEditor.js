import React from 'react';
import PropTypes from 'prop-types';
import { Editor } from 'slate-react';
import { Value } from 'slate';
import Html from 'slate-html-serializer';
import rules from './rules';
import Button from '../Button';
import { ICONS } from '../../constants';
import Box from '../Box';

// plugin for tables https://github.com/GitbookIO/slate-edit-table

const html = new Html({ rules });

const DEFAULT_NODE = 'paragraph';
function unwrapLink(editor) {
  editor.unwrapInline('link');
}

function insertImage(editor, src, target) {
  if (target) {
    editor.select(target);
  }

  editor.insertBlock({
    type: 'image',
    isVoid: true,
    data: { src },
  });
}

function wrapLink(editor, href) {
  editor.wrapInline({ type: 'link', data: { href } });

  editor.moveToEnd();
}

class MainEditor extends React.Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
  };

  static defaultProps = { className: null };

  constructor(props) {
    super(props);
    this.state = {
      value: Value.fromJSON({
        document: {
          nodes: [
            {
              object: 'block',
              type: 'paragraph',
              nodes: [
                {
                  object: 'text',
                  leaves: [
                    {
                      text: '',
                    },
                  ],
                },
              ],
            },
          ],
        },
      }),
    };

    this.onClickImage = this.onClickImage.bind(this);
  }

  componentDidMount() {
    // eslint-disable-next-line react/no-did-mount-set-state
    /*  this.setState({
      value: html.deserialize(this.props.initialValue),
    }); */
  }

  onChange = ({ value }) => {
    // TODO check if localstorage is available
    const { onChange } = this.props;
    // eslint-disable-next-line
    if (value.document !== this.state.value.document) {
      const string = html.serialize(value);
      onChange(string);
      // localStorage.setItem('content', string);
    }
    this.setState({ value });
  };

  onClickMark(event, type) {
    event.preventDefault();
    this.editor.toggleMark(type);
  }

  onClickBlock(event, type) {
    event.preventDefault();

    const { editor } = this;
    const { value } = editor;
    const { document } = value;

    // Handle everything but list buttons.
    if (type !== 'bulleted-list' && type !== 'numbered-list') {
      const isActive = this.hasBlock(type);
      const isList = this.hasBlock('list-item');

      if (isList) {
        editor
          .setBlocks(isActive ? DEFAULT_NODE : type)
          .unwrapBlock('bulleted-list')
          .unwrapBlock('numbered-list');
      } else {
        editor.setBlocks(isActive ? DEFAULT_NODE : type);
      }
    } else {
      // Handle the extra wrapping required for list buttons.
      const isList = this.hasBlock('list-item');
      const isType = value.blocks.some(
        block =>
          !!document.getClosest(block.key, parent => parent.type === type),
      );

      if (isList && isType) {
        editor
          .setBlocks(DEFAULT_NODE)
          .unwrapBlock('bulleted-list')
          .unwrapBlock('numbered-list');
      } else if (isList) {
        editor
          .unwrapBlock(
            type === 'bulleted-list' ? 'numbered-list' : 'bulleted-list',
          )
          .wrapBlock(type);
      } else {
        editor.setBlocks('list-item').wrapBlock(type);
      }
    }
  }

  onClickLink = event => {
    event.preventDefault();
    const { editor } = this;
    const { value } = editor;
    const hasLinks = this.hasLinks();

    if (hasLinks) {
      editor.command(unwrapLink);
    } else if (value.selection.isExpanded) {
      const href = window.prompt('Enter the URL of the link:', 'https://');
      if (href === null) {
        return;
      }
      editor.command(wrapLink, href);
    } else {
      const href = window.prompt('Enter the URL of the link:', 'https://');
      if (href === null) {
        return;
      }

      const text = window.prompt('Enter the text for the link:');

      if (text === null) {
        return;
      }
      editor
        .insertText(text)
        .moveFocusBackward(text.length)
        .command(wrapLink, href);
    }
  };

  onKeyDown = (event, editor, next) => {
    switch (event.key) {
      case ' ':
        return this.onSpace(event, editor, next);
      case 'Backspace':
        return this.onBackspace(event, editor, next);
      case 'Enter':
        return this.onEnter(event, editor, next);
      default:
        return next();
    }
  };

  onSpace = (event, editor, next) => {
    const { value } = editor;
    const { selection } = value;
    if (value.isExpanded) return next();

    const { startBlock } = value;
    const { start } = selection;
    const chars = startBlock.text.slice(0, start.offset).replace(/\s*/g, '');
    const type = this.getType(chars);

    if (!type) return next();
    if (type === 'list-item' && startBlock.type === 'list-item') return next();
    event.preventDefault();

    editor.setBlocks(type);

    if (type === 'list-item') {
      editor.wrapBlock('bulleted-list');
    }

    editor.moveFocusToStartOfNode(startBlock).delete();
    return next();
  };

  onBackspace = (event, editor, next) => {
    const { value } = editor;
    const { selection } = value;
    if (selection.isExpanded) return next();
    if (selection.start.offset !== 0) return next();

    const { startBlock } = value;
    if (startBlock.type === 'paragraph') return next();

    event.preventDefault();
    editor.setBlocks('paragraph');

    if (startBlock.type === 'list-item') {
      editor.unwrapBlock('bulleted-list');
    }
    return next();
  };

  onEnter = (event, editor, next) => {
    const { value } = editor;
    const { selection } = value;
    const { start, end, isExpanded } = selection;
    if (isExpanded) return next();

    const { startBlock } = value;
    if (start.offset === 0 && startBlock.text.length === 0)
      return this.onBackspace(event, editor, next);
    if (end.offset !== startBlock.text.length) return next();

    if (
      startBlock.type !== 'heading-one' &&
      startBlock.type !== 'heading-two' &&
      startBlock.type !== 'heading-three' &&
      startBlock.type !== 'heading-four' &&
      startBlock.type !== 'heading-five' &&
      startBlock.type !== 'heading-six' &&
      startBlock.type !== 'block-quote'
    ) {
      return next();
    }

    event.preventDefault();
    editor.splitBlock().setBlocks('paragraph');
    return next();
  };

  onClickImage(event) {
    event.preventDefault();
    const src = window.prompt('Enter the URL of the image:');
    if (!src) return;

    this.editor.command(insertImage, src);
  }

  getType = chars => {
    switch (chars) {
      case '*':
      case '-':
      case '+':
        return 'list-item';
      case '>':
        return 'block-quote';
      case '#':
        return 'heading-one';
      case '##':
        return 'heading-two';
      case '###':
        return 'heading-three';
      case '####':
        return 'heading-four';
      case '#####':
        return 'heading-five';
      case '######':
        return 'heading-six';
      default:
        return null;
    }
  };

  hasLinks = () => {
    const { value } = this.state;
    return value.inlines.some(inline => inline.type === 'link');
  };

  hasMark = type => {
    const { value } = this.state;
    return value.activeMarks.some(mark => mark.type === type);
  };

  hasBlock = type => {
    const { value } = this.state;
    return value.blocks.some(node => node.type === type);
  };

  ref = editor => {
    this.editor = editor;
  };

  reset() {
    this.setState({ value: html.deserialize('<p></p>') });
  }

  setInitialState(value) {
    this.setState({ value: html.deserialize(value) });
  }

  renderToolbar = () => (
    <Box>
      {this.renderMarkButton('bold')}
      {this.renderMarkButton('italic')}
      {this.renderMarkButton('link')}
      {this.renderMarkButton('underline')}
      {this.renderImageButton()}
    </Box>
  );

  renderImageButton() {
    return (
      <Button
        plain
        onClick={this.onClickImage}
        icon={
          <svg
            viewBox="0 0 24 24"
            width="24px"
            height="24px"
            role="img"
            aria-label="link"
          >
            <path fill="none" stroke="#000" strokeWidth="2" d={ICONS.image} />
          </svg>
        }
      />
    );
  }

  renderMarkButton(type) {
    const onMouseDown = event => this.onClickMark(event, type);
    // const isActive = this.hasMark(type);

    switch (type) {
      case 'bold':
        return <Button onClick={onMouseDown} plain icon={<strong>A</strong>} />;
      case 'italic':
        return <Button onClick={onMouseDown} plain icon={<em>A</em>} />;
      case 'underline':
        return <Button onClick={onMouseDown} plain icon={<u>U</u>} />;
      case 'link':
        return (
          <Button
            plain
            onClick={this.onClickLink}
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
        );
      default:
        throw new Error(`Type not recognized: ${type}`);
    }
  }

  renderBlockButton(type, icon) {
    let isActive = this.hasBlock(type);

    if (['numbered-list', 'bulleted-list'].includes(type)) {
      const {
        value: { document, blocks },
      } = this.state;
      if (blocks.size > 0) {
        const parent = document.getParent(blocks.first().key);
        isActive = this.hasBlock('list-item') && parent && parent.type === type;
      }
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
  /*
  onPaste = (event, change) => {
    if (change.value.isCollapsed) return;

    const transfer = getEventTransfer(event);
    const { type, text } = transfer;
    if (type != 'text' && type != 'html') return;
    if (!isUrl(text)) return;

    if (this.hasLinks()) {
      change.call(unwrapLink);
    }

    change.call(wrapLink, text);
    return true;
  };
*/
  /* eslint-disable class-methods-use-this  */

  renderMark(props, editor, next) {
    const { children, mark, attributes } = props;
    switch (mark.type) {
      case 'bold':
        return <strong {...attributes}>{children}</strong>;
      case 'code':
        return <code {...attributes}>{children}</code>;
      case 'italic':
        return <em {...attributes}>{children}</em>;
      case 'underline':
        return <u {...attributes}>{children}</u>;
      default:
        return next();
    }
  }

  renderBlock = (props, editor, next) => {
    const { attributes, children, node } = props;
    switch (node.type) {
      case 'paragraph':
        return <p {...attributes}>{children}</p>;
      case 'block-quote':
        return <blockquote {...attributes}>{children}</blockquote>;
      case 'bulleted-list':
        return <ul {...attributes}>{children}</ul>;
      case 'heading-one':
        return <h1 {...attributes}>{children}</h1>;
      case 'heading-two':
        return <h2 {...attributes}>{children}</h2>;
      case 'heading-three':
        return <h3 {...attributes}>{children}</h3>;
      case 'heading-four':
        return <h4 {...attributes}>{children}</h4>;
      case 'heading-five':
        return <h5 {...attributes}>{children}</h5>;
      case 'heading-six':
        return <h6 {...attributes}>{children}</h6>;
      case 'list-item':
        return <li {...attributes}>{children}</li>;
      case 'numbered-list':
        return <ol {...attributes}>{children}</ol>;
      case 'link': {
        const { data } = node;
        const href = data.get('href');
        return (
          <a {...attributes} href={href}>
            {children}
          </a>
        );
      }
      case 'image': {
        const src = node.data.get('src');
        const className = ''; // isSelected ? 'active' : null;
        const style = { display: 'block', maxWidth: '100%', margin: '0 auto' };
        return (
          <img
            {...attributes}
            alt="img"
            src={src}
            className={className}
            style={style}
          />
        );
      }
      default:
        return next();
    }
  };

  /* eslint-enable class-methods-use-this */
  renderEditor() {
    return (
      <Editor
        placeholder="Enter some text..."
        value={this.state.value} // eslint-disable-line
        ref={this.ref}
        onChange={this.onChange}
        onKeyDown={this.onKeyDown}
        renderBlock={this.renderBlock}
        renderMark={this.renderMark}
        autoFocus
      />
    );
  }

  render() {
    const { className } = this.props;
    return (
      <div className={className}>
        {this.renderToolbar()}
        {this.renderEditor()}
      </div>
    );
  }
}

export default MainEditor;
