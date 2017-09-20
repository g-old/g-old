// heavily inspired by https://github.com/grommet/grommet/blob/master/src/js/components/Search.js

import React from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import cn from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Search.css';
import Drop from '../Drop';

const onSink = event => {
  event.stopPropagation();
  event.nativeEvent.stopImmediatePropagation();
};

const renderLabel = suggestion => {
  if (typeof suggestion === 'object') {
    return suggestion.label || suggestion.value;
  }
  return suggestion;
};
class Search extends React.Component {
  static contextTypes = {
    intl: PropTypes.object,
    insertCss: PropTypes.func,
  };

  static propTypes = {
    dropAlign: PropTypes.shape(),
    id: PropTypes.string,
    onFocus: PropTypes.func,
    onDOMChange: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired,
    placeHolder: PropTypes.string,
    suggestions: PropTypes.arrayOf(
      PropTypes.oneOfType([
        PropTypes.shape({
          label: PropTypes.node,
          value: PropTypes.any,
        }),
        PropTypes.string,
      ]),
    ),
    value: PropTypes.string,
  };

  static defaultProps = {
    placeHolder: null,
    suggestions: null,
    value: null,
    dropAlign: null,
    id: null,
    onFocus: null,
  };
  constructor(props, context) {
    super(props, context);

    this.onAddDrop = this.onAddDrop.bind(this);
    this.onRemoveDrop = this.onRemoveDrop.bind(this);
    this.onChangeInput = this.onChangeInput.bind(this);
    this.onClickBody = this.onClickBody.bind(this);
    this.onClickSuggestion = this.onClickSuggestion.bind(this);
    this.fireDOMChange = this.fireDOMChange.bind(this);
    this.onFocusInput = this.onFocusInput.bind(this);

    this.state = {
      activeSuggestionIndex: -1,
      align: 'left',
      dropActive: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    const { dropActive } = this.state;
    if (
      nextProps.suggestions &&
      nextProps.suggestions.length > 0 &&
      !dropActive &&
      this.inputRef === document.activeElement
    ) {
      this.setState({ dropActive: true });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { dropAlign } = this.props;
    const { dropActive } = this.state;
    if (!dropActive && prevState.dropActive) {
      document.removeEventListener('click', this.onClickBody);
      if (this.drop) {
        this.drop.remove();
        this.drop = undefined;
      }
    }

    if (dropActive && !prevState.dropActive) {
      document.addEventListener('click', this.onClickBody);
      let baseElement;
      if (this.controlRef) {
        baseElement = findDOMNode(this.controlRef);
      } else {
        baseElement = this.inputRef;
      }
      const align = dropAlign || {
        top: 'bottom',
        left: 'left',
      };
      this.drop = new Drop(baseElement, this.renderDropContent(), {
        align,
        className: s.drop,
        responsive: false, // so suggestion changes don't re-align
        context: this.context,
      });

      this.inputRef.focus();
    } else if (this.drop) {
      this.drop.render(this.renderDropContent());
    }
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.onClickBody);
    if (this.drop) {
      this.drop.remove();
    }
  }

  onClickBody(event) {
    // don't close drop when clicking on input
    if (event.target !== this.inputRef) {
      this.onRemoveDrop();
    }
  }
  // eslint-disable-next-line no-unused-vars
  onChangeInput(event) {
    const { onDOMChange } = this.props;
    this.setState({ activeSuggestionIndex: -1, announceChange: true });
    if (onDOMChange) {
      this.fireDOMChange();
    }
  }

  onClickSuggestion(suggestion) {
    const { onSelect } = this.props;
    this.onRemoveDrop();
    if (onSelect) {
      onSelect(
        {
          target: this.inputRef || this.controlRef,
          suggestion,
        },
        true,
      );
    }
  }

  onAddDrop() {
    this.setState({ dropActive: true, activeSuggestionIndex: -1 });
  }

  onRemoveDrop() {
    this.setState({ dropActive: false });
  }

  onFocusInput(event) {
    const { onFocus, suggestions } = this.props;
    if (onFocus) {
      onFocus(event);
    }
    if (suggestions && suggestions.length > 0) {
      this.onAddDrop();
    }
  }

  fireDOMChange() {
    const { onDOMChange } = this.props;
    let event;
    try {
      event = new Event('change', {
        bubbles: true,
        cancelable: true,
      });
    } catch (e) {
      // IE11 workaround.
      event = document.createEvent('Event');
      event.initEvent('change', true, true);
    }
    const target = this.inputRef;
    target.dispatchEvent(event);
    onDOMChange(event);
  }

  renderDropContent() {
    const { suggestions } = this.props;
    const { activeSuggestionIndex } = this.state;

    let suggestionsNode;
    if (suggestions) {
      /* eslint-disable  react/no-array-index-key */
      suggestionsNode = suggestions.map(
        (suggestion, index) =>
          <div
            key={index}
            className={cn(
              s.searchSuggestion,
              index === activeSuggestionIndex ? s.active : null,
            )}
            tabIndex="-1"
            role="button"
            onClick={this.onClickSuggestion.bind(this, suggestion)} // eslint-disable-line
          >
            {renderLabel(suggestion)}
          </div>,
        this,
      );
      /* eslint-enable  react/no-array-index-key */

      suggestionsNode = (
        <div key="suggestions">
          {suggestionsNode}
        </div>
      );
    }

    const contents = [
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions
      <div key="contents" onClick={onSink}>
        {suggestionsNode}
      </div>,
    ];

    return (
      <div className={s.searchDrop}>
        {contents}
      </div>
    );
  }

  render() {
    const { id, placeHolder, value } = this.props;
    return (
      <div className={s.search}>
        <input
          ref={ref => (this.inputRef = ref)}
          type="search"
          id={id}
          placeholder={placeHolder}
          autoComplete="off"
          value={renderLabel(value)}
          className={s.searchInput}
          onChange={this.onChangeInput}
          onFocus={this.onFocusInput}
        />
        <svg
          className={s.searchIcon}
          version="1.1"
          viewBox="0 0 24 24"
          width="24px"
          height="24px"
          role="img"
          aria-label="search"
        >
          <path
            fill="none"
            stroke="#000"
            strokeWidth="2"
            d="M15,15 L22,22 L15,15 Z M9.5,17 C13.6421356,17 17,13.6421356 17,9.5 C17,5.35786438 13.6421356,2 9.5,2 C5.35786438,2 2,5.35786438 2,9.5 C2,13.6421356 5.35786438,17 9.5,17 Z"
          />
        </svg>
      </div>
    );
  }
}

export default withStyles(s)(Search);
