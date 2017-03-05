/* eslint-disable no-shadow */

import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cn from 'classnames';
import s from './Statement.css';

class Statement extends React.Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    position: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
  };

  render() {
    return (
      <div className={cn(s.root, this.props.position === 'pro' ? s.pro : s.contra)}>
        <div>
          {this.props.title}
        </div>
        <div>
          {this.props.text}
        </div>
      </div>
    );
  }
}

export default withStyles(s)(Statement);
