import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/withStyles';
import cn from 'classnames';
import s from './Notification.css';
import Box from '../Box';

class Notification extends React.Component {
  static propTypes = {
    message: PropTypes.node.isRequired,
    action: PropTypes.node,
    type: PropTypes.oneOf(['success', 'error', 'alert']).isRequired,
  };

  static defaultProps = {
    action: null,
  };

  render() {
    const { message, type, action } = this.props;
    let className;
    switch (type) {
      case 'success': {
        className = s.success;
        break;
      }
      case 'error': {
        className = s.error;
        break;
      }
      case 'alert': {
        className = s.alert;

        break;
      }

      default:
        className = s.error;
    }
    return (
      <Box pad className={cn(className, s.notification)}>
        <span>{message}</span>
        {action}
      </Box>
    );
  }
}

export default withStyles(s)(Notification);
