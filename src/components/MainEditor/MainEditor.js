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
function unwrapLink(change) {
  change.unwrapInline('link');
}

function insertImage(change, src, target) {
  if (target) {
    change.select(target);
  }

  change.insertBlock({
    type: 'image',
    isVoid: true,
    data: { src },
  });
}
const getType = chars => {
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

function wrapLink(change, href) {
  change.wrapInline({
    type: 'link',
    data: { href },
  });

  change.collapseToEnd();
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
    if (value.document !== this.state.value.document) {
      const string = html.serialize(value);
      this.props.onChange(string);
      // localStorage.setItem('content', string);
    }
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

  onClickLink = event => {
    event.preventDefault();
    const { value } = this.state;
    const hasLinks = this.hasLinks();
    const change = value.change();

    if (hasLinks) {
      change.call(unwrapLink);
    } else if (value.isExpanded) {
      const href = window.prompt('Enter the URL of the link:', 'https://');
      if (href) {
        change.call(wrapLink, href);
      }
    } else {
      const href = window.prompt('Enter the URL of the link:', 'https://');
      const text = window.prompt('Enter the text for the link:');
      if (href && text) {
        change
          .insertText(text)
          .extend(0 - text.length)
          .call(wrapLink, href);
      }
    }

    this.onChange(change);
  };

  onKeyDown = (event, change) => {
    switch (event.key) {
      case ' ':
        return this.onSpace(event, change);
      case 'Backspace':
        return this.onBackspace(event, change);
      case 'Enter':
        return this.onEnter(event, change);
      default:
        return undefined;
    }
  };

  onSpace = (event, change) => {
    const { value } = change;
    if (value.isExpanded) return false;

    const { startBlock, startOffset } = value;
    const chars = startBlock.text.slice(0, startOffset).replace(/\s*/g, '');
    const type = getType(chars);

    if (!type) return false;
    if (type === 'list-item' && startBlock.type === 'list-item') return false;
    event.preventDefault();

    change.setBlocks(type);

    if (type === 'list-item') {
      change.wrapBlock('bulleted-list');
    }

    change.extendToStartOf(startBlock).delete();
    return true;
  };

  onBackspace = (event, change) => {
    const { value } = change;
    if (value.isExpanded) return undefined;
    if (value.startOffset !== 0) return undefined;

    const { startBlock } = value;
    if (startBlock.type === 'paragraph') return undefined;

    event.preventDefault();
    change.setBlocks('paragraph');

    if (startBlock.type === 'list-item') {
      change.unwrapBlock('bulleted-list');
    }

    return true;
  };

  onEnter = (event, change) => {
    const { value } = change;
    if (value.isExpanded) return undefined;

    const { startBlock, startOffset, endOffset } = value;
    if (startOffset === 0 && startBlock.text.length === 0)
      return this.onBackspace(event, change);
    if (endOffset !== startBlock.text.length) return undefined;

    if (
      startBlock.type !== 'heading-one' &&
      startBlock.type !== 'heading-two' &&
      startBlock.type !== 'heading-three' &&
      startBlock.type !== 'heading-four' &&
      startBlock.type !== 'heading-five' &&
      startBlock.type !== 'heading-six' &&
      startBlock.type !== 'block-quote'
    ) {
      return undefined;
    }

    event.preventDefault();
    change.splitBlock().setBlocks('paragraph');
    return true;
  };

  onClickImage(event) {
    event.preventDefault();
    const src = window.prompt('Enter the URL of the image:');
    if (!src) return;

    const change = this.state.value.change().call(insertImage, src);

    this.onChange(change);
  }

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
      {/* {this.renderMarkButton('underline', 'format_underline')}
      {this.renderMarkButton('code', 'code')}
      {this.renderBlockButton('heading-one', 'looks_one')}
      {this.renderBlockButton('heading-two', 'looks_two')}
      {this.renderBlockButton('block-quote', 'format_quote')}
      {this.renderBlockButton('numbered-list', 'format_list_numbered')}
  {this.renderBlockButton('bulleted-list', 'format_list_bulleted')} */}
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
  renderMark(props) {
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
        throw new Error(`Type not recognized: ${mark.type}`);
    }
  }

  renderNode = props => {
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
            alt="img"
            src={src}
            className={className}
            style={style}
            {...attributes}
          />
        );
      }
      default:
        throw new Error(`Type not recognized: ${node.type}`);
    }
  };

  /* eslint-enable class-methods-use-this */
  renderEditor() {
    return (
      <Editor
        placeholder="Enter some text..."
        value={this.state.value}
        onChange={this.onChange}
        onKeyDown={this.onKeyDown}
        renderNode={this.renderNode}
        renderMark={this.renderMark}
        autoFocus
      />
    );
  }

  render() {
    return (
      <div className={this.props.className}>
        {this.renderToolbar()}
        {this.renderEditor()}
      </div>
    );
  }
}

export default MainEditor;
