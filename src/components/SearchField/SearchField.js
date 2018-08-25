/* eslint-disable css-modules/no-unused-class */
import React from 'react';
import PropTypes from 'prop-types';
import Autosuggest from 'react-autosuggest';
import AutosuggestHighlightMatch from 'autosuggest-highlight/match';
import AutosuggestHighlightParse from 'autosuggest-highlight/parse';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './SearchField.css';

function getSuggestionValue(suggestion) {
  return `${suggestion.name} ${suggestion.surname}`;
}

function renderSuggestion(suggestion, { query }) {
  const suggestionText = `${suggestion.name} ${suggestion.surname}`;
  const matches = AutosuggestHighlightMatch(suggestionText, query);
  const parts = AutosuggestHighlightParse(suggestionText, matches);
  const backgroundImage = suggestion.thumbnail
    ? {
        backgroundImage: `url(${suggestion.thumbnail})`,
        backgroundSize: '3em 3em',
        backgroundRepeat: 'no-repeat',
      }
    : {
        backgroundColor: '#fff',
      };
  return (
    <span className={s.suggestionContent} style={backgroundImage}>
      <span className={s.name}>
        {parts.map((part, index) => {
          const className = part.highlight ? 'highlight' : null;
          return (
            // eslint-disable-next-line react/no-array-index-key
            <span className={className && s.highlight} key={index}>
              {part.text}
            </span>
          );
        })}
      </span>
    </span>
  );
}
function escapeRegexCharacters(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

class SearchField extends React.Component {
  static propTypes = {
    data: PropTypes.arrayOf(PropTypes.object),
    fetch: PropTypes.func.isRequired,
    displaySelected: PropTypes.func.isRequired,
    onChange: PropTypes.func,
    clear: PropTypes.bool,
    value: PropTypes.string,
    onRef: PropTypes.func,
  };

  static defaultProps = {
    onChange: null,
    clear: false,
    data: null,
    value: null,
    onRef: null,
  };

  constructor(props) {
    super();
    this.state = {
      value: props.value || '',
      suggestions: [],
    };
    this.getSuggestions = this.getSuggestions.bind(this);
    this.onSuggestionSelected = this.onSuggestionSelected.bind(this);
  }

  componentDidMount() {
    const { onRef } = this.props;
    if (onRef) {
      onRef(this);
    }
  }

  componentWillReceiveProps({ clear, value }) {
    const { value: oldValue, clear: oldClear } = this.props;
    if (clear && !oldClear) {
      this.setState({ value: '' });
    }

    if (value && !oldValue) {
      this.setState({ value });
    }
  }

  componentWillUnmount() {
    const { onRef } = this.props;
    if (onRef) {
      onRef(null);
    }
  }

  onChange = (event, { newValue }) => {
    const { onChange } = this.props;
    this.setState({
      value: newValue,
    });
    if (onChange) {
      onChange({ value: newValue });
    }
  };

  // Autosuggest will call this function every time you need to update suggestions.
  // You already implemented this logic above, so just use it.
  onSuggestionsFetchRequested = ({ value }) => {
    this.setState({
      suggestions: this.getSuggestions(value),
    });
  };

  // Autosuggest will call this function every time you need to clear suggestions.
  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: [],
    });
  };

  onSuggestionSelected(
    event,
    { suggestion /* suggestionValue, suggestionIndex, sectionIndex, method */ },
  ) {
    const { displaySelected } = this.props;
    displaySelected(suggestion);
  }

  getSuggestions(value) {
    const { data, fetch } = this.props;
    const escapedValue = escapeRegexCharacters(value.trim());

    if (escapedValue === '') {
      return [];
    }
    fetch({ term: escapedValue });
    const regex = new RegExp(`\\b${escapedValue}`, 'i');
    const res = data.filter(person => regex.test(getSuggestionValue(person)));
    return res;
  }

  reset() {
    this.setState({ value: '' });
  }

  render() {
    const { value, suggestions } = this.state;

    // Autosuggest will pass through all these props to the input element.
    const inputProps = {
      placeholder: 'Type a name ',
      value,
      onChange: this.onChange,
    };

    // http://codepen.io/moroshko/pen/KVaGJE for debouncing!
    return (
      <Autosuggest
        theme={s}
        suggestions={suggestions}
        onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
        onSuggestionsClearRequested={this.onSuggestionsClearRequested}
        getSuggestionValue={getSuggestionValue}
        renderSuggestion={renderSuggestion}
        inputProps={inputProps}
        onSuggestionSelected={this.onSuggestionSelected}
      />
    );
  }
}

export default withStyles(s)(SearchField);
