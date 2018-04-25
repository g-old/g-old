import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import { defineMessages, FormattedMessage } from 'react-intl';
import {
  loadWorkTeam,
  joinWorkTeam,
  leaveWorkTeam,
} from '../../actions/workTeam';
import { createRequest, deleteRequest } from '../../actions/request';
import { getWorkTeam, getWorkTeamStatus } from '../../reducers';
import WorkTeam from '../../components/WorkTeam';
import Box from '../../components/Box';
import Nav from './NavSidebar';
import DiscussionPreview from '../../components/DiscussionPreview';
import ProposalPreview from '../../components/ProposalPreview';

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
  static onProposalClick({ proposalId, pollId }) {
    history.push(`/proposal/${proposalId}/${pollId}`);
  }
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
    history.push(`${this.props.workTeamData.id}/discussions/${discussionId}`);
  }
  renderDiscussions() {
    const { discussions } = this.props.workTeamData;
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
    const { proposals } = this.props.workTeamData;

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
    const { workTeamData = {}, user } = this.props;
    const { smallSize } = this.state;
    let sidebar;
    let content;
    const isResponsive = false; // to deactivate
    if (!smallSize && isResponsive) {
      sidebar = (
        <Nav
          {...this.props.workTeamData}
          handleNavClicks={(e, resource) => {
            this.setState({ content: resource });
          }}
        />
      );
      if (this.state.content === 'discussions') {
        content = this.renderDiscussions();
      } else if (this.state.content === 'proposals') {
        content = this.renderProposals();
      } else {
        content = (
          <div>
            {'JOINING AND LEAVING WORKTEAM CURRENTLY ONLY IN MOBILE VERSION'}{' '}
            <button
              onClick={() => {
                this.responsive.stop();
                this.setState({ smallSize: true });
              }}
            >
              Click to switch
            </button>
          </div>
        );
      }
    } else {
      content = (
        <WorkTeam
          {...workTeamData}
          onJoinRequest={this.props.createRequest}
          updates={this.props.workTeamUpdates}
          onJoin={this.props.joinWorkTeam}
          onLeave={this.props.leaveWorkTeam}
          onDeleteRequest={this.props.deleteRequest}
          user={user}
        />
      );
    }
    return (
      <Box justify={smallSize || !isResponsive}>
        {sidebar}
        {content}
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
};

export default connect(mapStateToProps, mapDispatch)(WorkTeamContainer);
