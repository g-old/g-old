import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './UserProfile.css';

class UserProfile extends React.Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
  };
  render() {
    const { avatar, name, surname, email } = this.props.user;
    return (
      <div className={s.root}>
        <div className={s.container}>
          <img
            className={s.avatar}
            src={avatar || `https://api.adorable.io/avatars/256/${name}${surname}.io.png`}
            alt="IMG"
          />
          <div>
            <h3>{name}</h3>
            <h3>{surname}</h3>
          </div>
          <div>
            <span>{email}<button>CHANGE</button></span>
          </div>
        </div>
      </div>
    );
  }
}

export default withStyles(s)(UserProfile);
