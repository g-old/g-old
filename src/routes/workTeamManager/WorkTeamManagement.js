import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import { defineMessages, FormattedMessage } from 'react-intl';
import { loadWorkTeam } from '../../actions/workTeam';
import { getWorkTeam } from '../../reducers';
import DiscussionInput from '../../components/DiscussionInput';

// import FetchError from '../../components/FetchError';

class WorkTeamManagement extends React.Component {
  static propTypes = {
    //  workTeamData: PropTypes.shape({}),
    id: PropTypes.string.isRequired,
  };

  static defaultProps = {
    workTeamData: null,
  };
  render() {
    return (
      <div>
        <h1>MANAGER</h1>
        <DiscussionInput workTeamId={this.props.id} />
      </div>
    );
  }
}

const mapStateToProps = (state, { id }) => ({
  workTeamData: getWorkTeam(state, id),
});

const mapDispatch = {
  loadWorkTeam,
};

export default connect(mapStateToProps, mapDispatch)(WorkTeamManagement);
