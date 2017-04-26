import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Sidebar.css';

class Sidebar extends React.Component {
  static propTypes = {
    children: PropTypes.object,
  };
  render() {
    const { children } = this.props;
    return (
      <div>
        <div>
          {children}
        </div>
      </div>
    );
  }
}

export default withStyles(s)(Sidebar);
