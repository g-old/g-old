// Heavily inspired by grommet
/* eslint-disable */
import React from 'react';
import PropTypes from 'prop-types';

class List extends React.Component {
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
    this.state = { activeItem: undefined };
  }

  componentDidUpdate(prevProps, prevState) {
    const { selected } = this.state;
    if (JSON.stringify(selected) !== JSON.stringify(prevState.selected)) {
      this.setSelection();
    }
  }

  setSelection() {
    if (this.listRef) {
    }
  }
  render() {
    return (
      <ul ref={ref => this.listRef = ref}>
        {children}
      </ul>
    );
  }
}
/* eslint-enable */
export default List;
