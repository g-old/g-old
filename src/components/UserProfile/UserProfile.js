import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { validateEmail as checkEmail } from '../../core/helpers';
import { updateUser } from '../../actions/user';
import s from './UserProfile.css';

class UserProfile extends React.Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    updateUser: PropTypes.func.isRequired,
    updates: PropTypes.object,
  };
  constructor(props) {
    super(props);
    this.state = {
      password: '',
      passwordNew: '',
      passwordAgain: '',
      errors: { password: {}, passwordAgain: {}, passwordNew: {} },
      showEmailInput: false,
    };
    this.onEditEmail = ::this.onEditEmail;
    this.onPasswordChange = ::this.onPasswordChange;
    this.onPasswordAgainChange = ::this.onPasswordAgainChange;
    this.onPasswordNewChange = ::this.onPasswordNewChange;
    this.onUpdatePassword = ::this.onUpdatePassword;
    this.onUpdateEmail = ::this.onUpdateEmail;
    this.onEmailChange = ::this.onEmailChange;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.updates.email) {
      this.setState({ showEmailInput: false });
    }
  }
  onEditEmail() {
    this.setState({ showEmailInput: !this.state.showEmailInput, newEmail: this.props.user.email });
  }
  onUpdateEmail() {
    const newEmail = this.state.newEmail.trim().toLowerCase();
    if (newEmail !== this.props.user.email.trim().toLowerCase()) {
      if (checkEmail(newEmail) && this.props.user.id) {
        alert(JSON.stringify(newEmail));
        this.props.updateUser({ id: this.props.user.id, email: newEmail });
      }
    }
  }
  onEmailChange(e) {
    this.setState({ newEmail: e.target.value });
  }
  onUpdatePassword() {
    this.props.updateUser({});
  }
  onPasswordChange(e) {
    const password = e.target.value;
    if (this.state.errors.password.touched) {
      this.setState({
        errors: {
          ...this.state.errors,
          password: { ...this.state.errors.password, touched: false },
        },
      });
    }
    this.setState({ password });
  }
  onPasswordAgainChange(e) {
    const passwordAgain = e.target.value;
    if (this.state.errors.passwordAgain.touched) {
      this.setState({
        errors: {
          ...this.state.errors,
          passwordAgain: { ...this.state.errors.passwordAgain, touched: false },
        },
      });
    }
    this.setState({ passwordAgain });
  }
  onPasswordNewChange(e) {
    const passwordNew = e.target.value;
    if (this.state.errors.passwordNew.touched) {
      this.setState({
        errors: {
          ...this.state.errors,
          passwordNew: { ...this.state.errors.passwordNew, touched: false },
        },
      });
    }
    this.setState({ passwordNew });
  }
  onSubmit() {
    this.validateForm();
  }
  validateForm() {
    const validate = this.state.password;
    console.log(validate);
  }
  render() {
    const updates = this.props.updates;
    // const showEmail = !updates.email.pending || updates.email.success || updates.email.error;

    const { avatar, name, surname, email } = this.props.user;
    const emailField = this.state.showEmailInput
      ? <input type="text" onChange={this.onEmailChange} value={this.state.newEmail} />
      : email;

    const updateEmailBtn = this.state.showEmailInput
      ? (<button onClick={this.onUpdateEmail} disabled={updates.email && updates.email.pending}>
          UPDATE
        </button>)
      : null;
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
            <h3> Settings</h3>
            <div>
              {updates &&
                updates.email &&
                updates.email.error &&
                <span className={s.error}> {'ERROR '}</span>}
              <span>
                {emailField}
                {updateEmailBtn}
                <button onClick={this.onEditEmail}>
                  {this.state.showEmailInput ? 'CANCEL' : 'CHANGE'}
                </button>
              </span>
            </div>
            <div>
              {'Password ändern'}
              <div>
                <label htmlFor="password">
                  Your current password
                </label>
                <input
                  className={s.input}
                  name="password"
                  type="password"
                  onChange={this.onPasswordChange}
                  value={this.state.password}
                  placeholder={'Enter your current password'}
                />
              </div>
              <div>
                <label htmlFor="passwordNew">
                  New Password
                </label>
                <input
                  className={s.input}
                  name="passwordNew"
                  type="password"
                  onChange={this.onPasswordNewChange}
                  value={this.state.passwordNew}
                  placeholder={'enter a new password'}
                />
              </div>
              <div>
                <label htmlFor="passwordAgain">
                  Confirm new Password
                </label>
                <input
                  className={s.input}
                  name="passwordAgain"
                  type="password"
                  onChange={this.onPasswordAgainChange}
                  value={this.state.passwordAgain}
                  placeholder={'enter the password again'}
                />
              </div>
              <button onClick={() => alert('TO IMPLEMENT')}>Update Password</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
const mapDispatch = {
  updateUser,
};
const mapStateToProps = state => {
  const updates = state.ui.updates[state.user] || {};
  const user = state.entities.users[state.user];
  return {
    updates,
    user,
  };
};

export default connect(mapStateToProps, mapDispatch)(withStyles(s)(UserProfile));
