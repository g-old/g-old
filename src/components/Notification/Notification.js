import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Notification.css';
import Box from '../Box';

class Notification extends React.Component {
  static propTypes = {
    message: PropTypes.string.isRequired,
  };
  render() {
    const { message } = this.props;
    return (
      <Box pad className={s.notification}>
        <Box className={s.notification}>
          <span className={s.message}>{message} </span>
        </Box>
      </Box>
    );
  }
}

export default withStyles(s)(Notification);
