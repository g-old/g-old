import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { loadWorkTeamMembers } from '../../actions/workTeam';
import { getWorkTeam, getWorkTeamStatus } from '../../reducers';

import history from '../../history';
import AccountsView from '../../components/AccountsView/AccountsView';

const handleItemClick = id => {
  history.push(`/accounts/${id}`);
};

class AccountList extends React.Component {
  static propTypes = {
    loadWorkTeamMembers: PropTypes.func.isRequired,
    workTeam: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }).isRequired,
    status: PropTypes.shape({}).isRequired,
  };

  constructor(props) {
    super(props);
    this.handleOnRetry = this.handleOnRetry.bind(this);
  }

  handleOnRetry() {
    const { loadWorkTeamMembers: fetchMembers, workTeam } = this.props;
    fetchMembers({
      id: workTeam.id,
    });
  }

  render() {
    const { status, workTeam } = this.props;
    const memberList = workTeam.members || [];
    return (
      <AccountsView
        label={workTeam.displayName}
        userCount={memberList.length}
        onRetry={this.handleOnRetry}
        onUserClick={handleItemClick}
        users={memberList}
        pageInfo={{ pending: status.pending, errorMessage: status.error }}
      />
    );
  }
}

const mapStateToProps = (state, { id }) => ({
  workTeam: getWorkTeam(state, id),
  status: getWorkTeamStatus(state),
});

const mapDispatch = {
  loadWorkTeamMembers,
};

export default connect(
  mapStateToProps,
  mapDispatch,
)(AccountList);
