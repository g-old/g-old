/* eslint-disable no-shadow */

import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cn from 'classnames';
import s from './Statement.css';

class Statement extends React.Component {
  static propTypes = {
    title: PropTypes.String,
    position: PropTypes.boolean,
  };

  render() {
    return (
      <div className={cn(s.root, this.props.position === 'true' ? s.pro : s.contra)}>
        {this.props.title}
      </div>
    );
  }
}

export default withStyles(s)(Statement);
