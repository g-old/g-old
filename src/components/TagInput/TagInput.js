import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './TagInput.css';
import Box from '../Box';

function filteredSuggestions(query, suggestions) {
  return suggestions.filter(
    item => item.text.toLowerCase().indexOf(query.toLowerCase()) === 0,
  );
}
// heavily inspired by : https://github.com/prakhar1989/react-tags/
/* eslint-disable jsx-a11y/no-static-element-interactions */
const RemoveMe = props => (
  <a onClick={props.onClick}>{String.fromCharCode(215)}</a>
);
/* eslint-enable jsx-a11y/no-static-element-interactions */

RemoveMe.propTypes = {
  onClick: PropTypes.func.isRequired,
};

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
const Tag = props => (
  <span
    className={props.readOnly ? s.availableTag : s.tag}
    onClick={props.onClick}
  >
    {props.label}
    {!props.readOnly && <RemoveMe onClick={props.onDelete} />}
  </span>
);
/* eslint-enable jsx-a11y/no-static-element-interactions */
Tag.propTypes = {
  label: PropTypes.string.isRequired,
  onDelete: PropTypes.func,
  readOnly: PropTypes.bool,
  onClick: PropTypes.func,
};
Tag.defaultProps = {
  readOnly: false,
  onClick: () => {},
  onDelete: () => {},
};

class TagInput extends React.Component {
  static propTypes = {
    handleAddition: PropTypes.func.isRequired,
    handleDelete: PropTypes.func.isRequired,
    tags: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        text: PropTypes.string,
      }),
    ).isRequired,
    availableTags: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        text: PropTypes.string,
      }),
    ).isRequired,
    name: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      suggestions: this.props.tags,
      currentTags: {},
      tagIds: [],
      query: '',
      selectedIndex: -1,
      selectionMode: false,
      nextId: 'xt0',
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  componentWillReceiveProps(props) {
    const suggestions = filteredSuggestions(this.state.query, props.tags);
    this.setState({
      suggestions,
    });
  }

  handleDelete(i) {
    this.props.handleDelete(i);
    this.setState({ query: '' });
    this.resetAndFocusInput();
  }

  handleSuggestionClick(i) {
    this.addTag(this.state.suggestions[i]);
  }

  resetAndFocusInput() {
    this.textInput.value = '';
    this.textInput.focus();
  }

  addTag(tag) {
    //  const possibleMatches = filteredSuggestions(tag, this.props.suggestions);

    this.props.handleAddition(tag);

    // reset the state
    this.setState({
      query: '',
      selectionMode: false,
      selectedIndex: -1,
    });

    this.resetAndFocusInput();
  }

  handleKeyDown(e) {
    if (e.keyCode === 13 || e.keyCode === 9) {
      const query = this.state.query.trim();

      if (query) {
        e.preventDefault();
        const id = this.state.nextId;
        this.addTag({ id, text: query });
        this.setState({
          nextId: `xt${parseInt(this.state.nextId.slice(2), 10) + 1}`,
        });
      }
    }
  }

  handleInputChange(e) {
    const query = e.target.value.trim();
    const suggestions = filteredSuggestions(query, this.props.availableTags);

    let selectedIndex = this.state.selectedIndex;
    if (selectedIndex >= suggestions.length) {
      selectedIndex = suggestions.length - 1;
    }

    this.setState({
      query,
      suggestions,
      selectedIndex,
    });
  }

  render() {
    const tags = this.props.tags.map(i => (
      <Tag key={i.id} label={i.text} onDelete={() => this.handleDelete(i.id)} />
    ));

    const availableTags = this.props.availableTags.map(t => (
      <Tag
        key={t.id}
        label={t.text}
        onClick={() => this.props.handleAddition(t)}
        readOnly
      />
    ));
    const placeholder = 'Add a new tag';
    const maxLength = 20;
    const tagInput = (
      <div className={s.tagInput}>
        <input
          className={s.inputField}
          ref={input => {
            this.textInput = input;
          }}
          type="text"
          placeholder={placeholder}
          aria-label={placeholder}
          onBlur={this.handleBlur}
          onChange={this.handleInputChange}
          onKeyDown={this.handleKeyDown}
          onPaste={this.handlePaste}
          name={this.props.name}
          maxLength={maxLength}
        />
      </div>
    );
    return (
      <Box className={s.container} pad column>
        <Box wrap pad className={s.tags}>
          {tags}
          {tagInput}
        </Box>
        <Box pad wrap>
          {availableTags}
        </Box>
      </Box>
    );
  }
}

export default withStyles(s)(TagInput);
