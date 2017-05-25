import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './UserPanel.css';
import { updateUser, loadUserList, findUser } from '../../actions/user';
import FetchError from '../FetchError';
import AccountProfile from '../AccountProfile';
import Accordion from '../../components/Accordion';
import AccordionPanel from '../../components/AccordionPanel';
import SearchField from '../../components/SearchField';

import {
  getVisibleUsers,
  getUsersIsFetching,
  getUsersErrorMessage,
  getSessionUser,
} from '../../reducers';
/* eslint-disable jsx-a11y/no-static-element-interactions */

function renderUserSuggestion(user, obj) {
  return (
    <span
      style={{
        backgroundImage: `url(${user.avatar})`,
        backgroundSize: '3em 3em',
        backgroundRepeat: 'no-repeat',
        marginBottom: '1em',
        cursor: 'pointer',
      }}
      key={user.id}
      className={s.suggestionContent}
      onClick={() => {
        obj.setState({ showAccount: true, accountId: user.id });
      }}
    >
      <span className={s.name}>
        <span>{`${user.name} ${user.surname}`}</span>
      </span>
    </span>
  );
}
/* eslint-enable jsx-a11y/no-static-element-interactions */

class UserPanel extends React.Component {
  static propTypes = {
    guestArray: PropTypes.arrayOf(PropTypes.object),
    viewerArray: PropTypes.arrayOf(PropTypes.object),
    loadUserList: PropTypes.func,
    updateUser: PropTypes.func,
    guestArrayIsFetching: PropTypes.bool,
    guestArrayErrorMessage: PropTypes.string,
    viewerArrayIsFetching: PropTypes.bool,
    viewerArrayErrorMessage: PropTypes.string,
    findUser: PropTypes.func.isRequired,
    userArray: PropTypes.arrayOf(PropTypes.object),
    user: PropTypes.shape({
      id: PropTypes.string,
    }).isRequired,
  };
  constructor(props) {
    super(props);
    this.state = { selectedAccount: null, showAccount: false };
  }
  componentDidMount() {
    // this.props.loadUserList('viewer');
  }
  render() {
    const {
      guestArrayIsFetching,
      guestArrayErrorMessage,
      viewerArrayIsFetching,
      viewerArrayErrorMessage,
      viewerArray,
      guestArray,
    } = this.props;

    return (
      <div className={s.container}>
        <SearchField
          data={this.props.userArray}
          fetch={this.props.findUser}
          displaySelected={(data) => {
            this.setState({ accountId: data.id, showAccount: true });
          }}
        />
        {this.state.showAccount &&
          <div>
            <AccountProfile
              user={this.props.user}
              accountId={this.state.accountId}
              update={this.props.updateUser}
            />
            <button
              onClick={() => {
                this.setState({ showAccount: false });
              }}
            >
              CLOSE{' '}
            </button>
          </div>}
        <Accordion openMulti>
          <AccordionPanel
            heading="Guest accounts"
            onActive={() => {
              this.props.loadUserList('guest');
            }}
          >
            {guestArrayIsFetching && !guestArray.length && <p>Loading...</p>}
            {!guestArrayIsFetching &&
              !guestArray.length &&
              !guestArrayErrorMessage &&
              <p> No data</p>}
            {guestArrayErrorMessage &&
              <FetchError
                message={guestArrayErrorMessage}
                onRetry={() => this.props.loadUserList('guest')}
              />}
            {this.props.guestArray.map(user => renderUserSuggestion(user, this))}
          </AccordionPanel>
          <AccordionPanel
            heading="Viewer accounts"
            onActive={() => {
              this.props.loadUserList('viewer');
            }}
          >
            {viewerArrayIsFetching && !viewerArray.length && <p>Loading...</p>}
            {!viewerArrayIsFetching &&
              !viewerArray.length &&
              !viewerArrayErrorMessage &&
              <p> No data</p>}
            {viewerArrayErrorMessage &&
              <FetchError
                message={viewerArrayErrorMessage}
                onRetry={() => this.props.loadUserList('viewer')}
              />}
            {this.props.viewerArray.map(user => renderUserSuggestion(user, this))}
          </AccordionPanel>
        </Accordion>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  guestArray: getVisibleUsers(state, 'guest'),
  viewerArray: getVisibleUsers(state, 'viewer'),
  guestArrayIsFetching: getUsersIsFetching(state, 'guest'),
  viewerArrayIsFetching: getUsersIsFetching(state, 'viewer'),
  guestArrayErrorMessage: getUsersErrorMessage(state, 'guest'),
  viewerArrayErrorMessage: getUsersErrorMessage(state, 'viewer'),
  userArray: getVisibleUsers(state, 'all'),
  user: getSessionUser(state),
});

const mapDispatch = {
  updateUser,
  loadUserList,
  findUser,
};

export default connect(mapStateToProps, mapDispatch)(withStyles(s)(UserPanel));
