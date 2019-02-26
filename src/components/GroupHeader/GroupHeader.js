import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/withStyles';
import s from './GroupHeader.css';
import Image from '../Image';

class GroupHeader extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    imageSrc: PropTypes.string.isRequired,
  };

  static defaultProps = {
    className: null,
  };

  render() {
    const { imageSrc, children, className } = this.props;
    const backgroundContainer = (
      <div className={s.background}>
        <Image fit full src={imageSrc} />
      </div>
    );
    return (
      <div className={className}>
        {backgroundContainer}
        {children}
      </div>
    );
  }
}

export default withStyles(s)(GroupHeader);
