import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './ProposalsNavigation.css';
import Link from '../Link';

class Navigation extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    filter: PropTypes.string.isRequired,
  };

  render() {
    return (
      <div role="navigation">
        <p>
          <Link className={s.link} to="/proposals/active">
            {this.props.filter === 'active' ? 'ACTIVE' : 'active'}
          </Link>
          <Link className={s.link} to="/proposals/accepted">
            {this.props.filter === 'accepted' ? 'ACCEPTED' : 'accepted'}
          </Link>
          <Link className={s.link} to="/proposals/repelled">
            {this.props.filter === 'repelled' ? 'REPELLED' : 'repelled'}
          </Link>
        </p>
      </div>
    );
  }
}

export default withStyles(s)(Navigation);
