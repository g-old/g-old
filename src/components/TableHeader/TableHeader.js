import React from 'react';
import PropTypes from 'prop-types';
import Box from '../Box';
import Button from '../Button';

class TableHeader extends React.Component {
  static propTypes = {
    labels: PropTypes.arrayOf(PropTypes.node).isRequired,
    onSort: PropTypes.func, // (index, ascending?)
    sortAscending: PropTypes.bool,
    sortIndex: PropTypes.number,
  };

  static defaultProps = {
    onSort: null,
    sortAscending: null,
    sortIndex: null,
  };

  onSort(index) {
    const { onSort, sortAscending, sortIndex } = this.props;
    let nextAscending;
    if (index !== sortIndex) {
      nextAscending = false;
    } else {
      nextAscending = !sortAscending;
    }
    onSort(index, nextAscending);
  }

  render() {
    const { labels, onSort, sortAscending, sortIndex, ...props } = this.props;

    const cells = labels.map((label, index) => {
      let content = label;
      if (sortIndex >= 0) {
        let sortIndicator;
        if (index === sortIndex) {
          sortIndicator = sortAscending ? <span>ASC</span> : <span>DESC</span>;
        }
        content = (
          <Box
            direction="row"
            justify="start"
            align="center"
            pad={{ between: 'small' }}
          >
            <span>{content}</span>
            {sortIndicator}
          </Box>
        );

        if (onSort) {
          content = (
            // eslint-disable-next-line react/jsx-no-bind
            <Button plain fill onClick={this.onSort.bind(this, index)}>
              {content}
            </Button>
          );
        }
      }
      // eslint-disable-next-line react/no-array-index-key
      return <th key={index}>{content}</th>;
    });
    return (
      <thead {...props}>
        <tr>{cells}</tr>
      </thead>
    );
  }
}

export default TableHeader;
