// inspired by grommet

import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/withStyles';
import s from './Tag.css';

class Tag extends React.Component {
  static propTypes = {
    text: PropTypes.string.isRequired,
    handleTagClick: PropTypes.func,
    id: PropTypes.string.isRequired,
  };

  static defaultProps = {
    handleTagClick: undefined,
  };

  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    const { handleTagClick, id } = this.props;
    if (handleTagClick) {
      handleTagClick({ id });
    }
  }

  render() {
    const { text } = this.props;
    /* eslint-disable jsx-a11y/no-static-element-interactions */
    return (
      <span onClick={this.onClick} className={s.root}>
        {text}
      </span>
    );
  }
}

export default withStyles(s)(Tag);
