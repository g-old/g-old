import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './ProposalsNavigation.css';
import Link from '../Link';

class Navigation extends React.Component {
  static propTypes = {
    className: PropTypes.string,
  };

  render() {
    return (
      <div role="navigation">
        <p>
          <Link className={s.link} to="/proposals/active">
            ACTIVE
          </Link>
          <Link className={s.link} to="/proposals/accepted">
            ACCEPTED
          </Link>
          <Link className={s.link} to="/proposals/repelled">
            REPELLED
          </Link>
        </p>
      </div>
    );
  }
}

export default withStyles(s)(Navigation);
