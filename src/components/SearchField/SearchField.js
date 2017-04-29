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

  return (
    <span
      className={s.suggestionContent}
      style={{
        backgroundImage: `url(${suggestion.avatar})`,
        backgroundSize: '3em 3em',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <span className={s.name}>
        {parts.map((part, index) => {
          const className = part.highlight ? 'highlight' : null;
          // eslint-disable-next-line react/no-array-index-key
          return <span className={className && s.highlight} key={index}>{part.text}</span>;
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
  };
  constructor() {
    super();
    this.state = {
      value: '',
      suggestions: [],
    };
    this.getSuggestions = this.getSuggestions.bind(this);
    this.onSuggestionSelected = this.onSuggestionSelected.bind(this);
  }

  onChange = (event, { newValue }) => {
    this.setState({
      value: newValue,
    });
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
    { suggestion /* suggestionValue, suggestionIndex, sectionIndex, method*/ },
  ) {
    this.props.displaySelected(suggestion);
  }

  getSuggestions(value) {
    const escapedValue = escapeRegexCharacters(value.trim());

    if (escapedValue === '') {
      return [];
    }
    this.props.fetch({ term: escapedValue });
    const regex = new RegExp(`\\b${escapedValue}`, 'i');
    const res = this.props.data.filter(person => regex.test(getSuggestionValue(person)));
    return res;
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
