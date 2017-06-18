import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cn from 'classnames';
import s from './Notification.css';
import Box from '../Box';

class Notification extends React.Component {
  static propTypes = {
    message: PropTypes.node.isRequired,
    success: PropTypes.bool,
    action: PropTypes.node,
  };
  static defaultProps = {
    success: false,
    action: null,
  };
  render() {
    const { message, success, action } = this.props;
    return (
      <Box pad className={cn(success ? s.success : s.error, s.notification)}>
        <span>
          {message}
        </span>
        {action}
      </Box>
    );
  }
}

export default withStyles(s)(Notification);
