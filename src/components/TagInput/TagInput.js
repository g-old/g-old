// heavily inspired by : https://github.com/prakhar1989/react-tags/

/* @flow */
import React from 'react';
import type { ElementRef } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './TagInput.css';
import Box from '../Box';
import TagPreview from './TagPreview';
import Tag from '../Tag';
import RemoveMe from './RemoveMe';

/* eslint-disable jsx-a11y/no-static-element-interactions */

/* class Suggestions extends React.Component {
  render() {
    const suggestions = this.props.suggestions.map((s, index) => (
      <li
        key={index}
        onMouseDown={() => {}}
        className={index === this.props.selectedIndex ? s.active : null}
      >
        <span key={s.id}> {s.text}</span>
      </li>
    ));
    return (
      <div className={s.suggestions}>
        <ul> {suggestions}</ul>
      </div>
    );
  }
} */
/* eslint-disable jsx-a11y/no-static-element-interactions */

export type TagType = {
  id?: ID,
  text: string,
};
type Props = {
  onAddTag: TagType => void,
  onDeleteTag: ID => void,
  selectedTags: [TagType],
  suggestions: [TagType],
  name?: string,
  predefinedTagsOnly?: boolean,
  numTagsLimit: number,
};

type State = {
  query: string,
};

class TagInput extends React.Component<Props, State> {
  static defaultProps = {
    predefinedTagsOnly: null,
    name: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      query: '',
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.inputRef = React.createRef();
  }

  inputRef: ?ElementRef<any>;

  handleInputChange: () => void;

  handleKeyDown: () => void;

  handleDelete(tagId: ID) {
    const { onDeleteTag } = this.props;
    if (onDeleteTag) {
      onDeleteTag(tagId);
    }
    this.setState({ query: '' });
    this.resetAndFocusInput();
  }

  resetAndFocusInput() {
    if (this.inputRef && this.inputRef.current) {
      this.inputRef.current.focus();
      this.inputRef.current.value = '';
    }
  }

  addTag(tag: TagType) {
    const { onAddTag } = this.props;
    if (onAddTag) {
      onAddTag(tag);
    }

    // reset the state
    this.setState({
      query: '',
    });

    this.resetAndFocusInput();
  }

  handleKeyDown(e) {
    if (e.keyCode === 13 || e.keyCode === 9) {
      const { query } = this.state;
      const queryText = query.trim();

      if (queryText) {
        e.preventDefault();
        this.addTag({ text: queryText });
      }
    }
  }

  handleInputChange(e) {
    const query = e.target.value.trim();
    this.setState({
      query,
    });
  }

  renderSuggestions() {
    const { suggestions = [], onAddTag } = this.props;
    return suggestions.map(tag => (
      <Tag key={tag.id} id={tag.id} text={tag.text} handleTagClick={onAddTag} />
    ));
  }

  renderSelectedTags() {
    const { selectedTags = [] } = this.props;
    return selectedTags.map(tag => (
      <TagPreview
        className={s.availableTag}
        key={tag.id}
        id={tag.id}
        text={tag.text}
        onClick={() => tag.id && this.handleDelete(tag.id)}
      >
        <RemoveMe />
      </TagPreview>
    ));
  }

  render() {
    let inputField;
    const {
      predefinedTagsOnly,
      name = 'tagInput',
      selectedTags = [],
      numTagsLimit = 5,
    } = this.props;
    if (!predefinedTagsOnly && selectedTags.length < numTagsLimit) {
      const { query } = this.state;
      const maxLength = 20;
      const placeholder = 'Add a new tag';
      inputField = (
        <Box className={s.tagInput}>
          <input
            ref={this.inputRef}
            type="text"
            placeholder={placeholder}
            aria-label={placeholder}
            onChange={this.handleInputChange}
            onKeyDown={this.handleKeyDown}
            value={query}
            name={name}
            maxLength={maxLength}
            autoComplete={false}
          />
        </Box>
      );
    }
    return (
      <Box className={s.container} column>
        <Box wrap align pad>
          {this.renderSelectedTags()}
          {inputField}
        </Box>
        <Box pad wrap align>
          {this.renderSuggestions()}
        </Box>
      </Box>
    );
  }
}

export default withStyles(s)(TagInput);
