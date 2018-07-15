import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import { defineMessages, FormattedMessage } from 'react-intl';
import {
  loadWorkTeam,
  joinWorkTeam,
  leaveWorkTeam,
} from '../../actions/workTeam';
import { loadDiscussions } from '../../actions/discussion';
import { createRequest, deleteRequest } from '../../actions/request';
import { getWorkTeam, getWorkTeamStatus } from '../../reducers';
import WorkTeam from '../../components/WorkTeam';
import Box from '../../components/Box';
import Nav from './NavSidebar';
import DiscussionPreview from '../../components/DiscussionPreview';
import ProposalPreview from '../../components/ProposalPreview';
import { loadProposalsList } from '../../actions/proposal';

import history from '../../history';

import Responsive from '../../core/Responsive';

// import FetchError from '../../components/FetchError';

class WorkTeamContainer extends React.Component {
  static propTypes = {
    user: PropTypes.shape({}).isRequired,
    workTeamData: PropTypes.shape({
      id: PropTypes.string,
      discussions: PropTypes.arrayOf(PropTypes.shape({})),
      proposals: PropTypes.arrayOf(PropTypes.shape({})),
    }),
    requestUpdates: PropTypes.shape({}),
    createRequest: PropTypes.func.isRequired,
    deleteRequest: PropTypes.func.isRequired,
    joinWorkTeam: PropTypes.func.isRequired,
    leaveWorkTeam: PropTypes.func.isRequired,
    loadDiscussions: PropTypes.func.isRequired,
    loadProposalsList: PropTypes.func.isRequired,
    workTeamUpdates: PropTypes.shape({
      id: PropTypes.string,
      discussions: PropTypes.arrayOf(PropTypes.shape({})),
    }),
  };

  static defaultProps = {
    workTeamData: null,
    requestUpdates: null,
    workTeamUpdates: null,
  };

  constructor(props) {
    super(props);
    this.state = {};
    this.onResponsive = this.onResponsive.bind(this);
    this.renderDiscussions = this.renderDiscussions.bind(this);
    this.renderProposals = this.renderProposals.bind(this);
    this.handleDiscussionClick = this.handleDiscussionClick.bind(this);
  }

  componentDidMount() {
    this.responsive = Responsive.start(this.onResponsive);
  }

  static onProposalClick({ proposalId, pollId }) {
    history.push(`/proposal/${proposalId}/${pollId}`);
  }

  onResponsive(small) {
    // deactivate if we change resolutions
    if (small) {
      this.setState({
        smallSize: true,
      });
    } else {
      this.setState({
        smallSize: false,
      });
    }
  }

  // eslint-disable-next-line class-methods-use-this
  handleDiscussionClick({ discussionId }) {
    const { workTeamData } = this.props;
    history.push(`${workTeamData.id}/discussions/${discussionId}`);
  }

  renderDiscussions() {
    const {
      workTeamData: { discussions },
    } = this.props;
    return (
      <Box column padding="medium" pad>
        {discussions &&
          discussions.map(
            d =>
              d && (
                <DiscussionPreview
                  discussion={d}
                  onClick={this.handleDiscussionClick}
                />
              ),
          )}
      </Box>
    );
  }

  renderProposals() {
    const {
      workTeamData: { proposals },
    } = this.props;

    return (
      <Box column pad>
        {proposals &&
          proposals.map(
            p =>
              p && (
                <ProposalPreview
                  proposal={p}
                  onClick={WorkTeamContainer.onProposalClick}
                />
              ),
          )}
      </Box>
    );
  }

  render() {
    const {
      workTeamData = {},
      user,
      createRequest: makeRequest,
      workTeamUpdates,
      joinWorkTeam: join,
      leaveWorkTeam: leave,
      deleteRequest: eraseRequest,
      loadDiscussions: fetchDiscussions,
      loadProposalsList: loadProposals,
    } = this.props;
    const { smallSize, content } = this.state;
    let sidebar;
    let element;
    const isResponsive = false; // to deactivate
    if (!smallSize && isResponsive) {
      sidebar = (
        <Nav
          {...workTeamData}
          handleNavClicks={(e, resource) => {
            this.setState({ content: resource });
          }}
        />
      );
      if (content === 'discussions') {
        element = this.renderDiscussions();
      } else if (content === 'proposals') {
        element = this.renderProposals();
      }
    } else {
      element = (
        <WorkTeam
          {...workTeamData}
          onJoinRequest={makeRequest}
          updates={workTeamUpdates}
          onJoin={join}
          onLeave={leave}
          onDeleteRequest={eraseRequest}
          user={user}
          onLoadDiscussions={fetchDiscussions}
          onLoadProposals={loadProposals}
        />
      );
    }
    return (
      <Box justify={smallSize || !isResponsive}>
        {sidebar}
        {element}
      </Box>
    );
  }
}

const mapStateToProps = (state, { id }) => ({
  workTeamData: getWorkTeam(state, id),
  workTeamUpdates: getWorkTeamStatus(state),
});

const mapDispatch = {
  loadWorkTeam,
  createRequest,
  joinWorkTeam,
  leaveWorkTeam,
  deleteRequest,
  loadDiscussions,
  loadProposalsList,
};

export default connect(
  mapStateToProps,
  mapDispatch,
)(WorkTeamContainer);
