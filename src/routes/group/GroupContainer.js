import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import { defineMessages, FormattedMessage } from 'react-intl';
import {
  loadGroup,
  joinGroup,
  leaveGroup,
} from '../../actions/group';
import { createRequest, deleteRequest } from '../../actions/request';
import { getGroup, getGroupStatus } from '../../reducers';
import Group from '../../components/Group';
import Box from '../../components/Box';
import Nav from './NavSidebar';
import DiscussionPreview from '../../components/DiscussionPreview';
import ProposalPreview from '../../components/ProposalPreview';

import history from '../../history';

import Responsive from '../../core/Responsive';

// import FetchError from '../../components/FetchError';

class GroupContainer extends React.Component {
  static propTypes = {
    groupData: PropTypes.shape({
      id: PropTypes.string,
      discussions: PropTypes.arrayOf(PropTypes.shape({})),
      proposals: PropTypes.arrayOf(PropTypes.shape({})),
    }),
    requestUpdates: PropTypes.shape({}),
    createRequest: PropTypes.func.isRequired,
    deleteRequest: PropTypes.func.isRequired,
    joinGroup: PropTypes.func.isRequired,
    leaveGroup: PropTypes.func.isRequired,
    groupUpdates: PropTypes.shape({
      id: PropTypes.string,
      discussions: PropTypes.arrayOf(PropTypes.shape({})),
    }),
  };
  static defaultProps = {
    groupData: null,
    requestUpdates: null,
    groupUpdates: null,
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
    history.push(`${this.props.groupData.id}/discussions/${discussionId}`);
  }
  renderDiscussions() {
    const { discussions } = this.props.groupData;
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
    const { proposals } = this.props.groupData;

    return (
      <Box column pad>
        {proposals &&
          proposals.map(
            p =>
              p && (
                <ProposalPreview
                  proposal={p}
                  onClick={GroupContainer.onProposalClick}
                />
              ),
          )}
      </Box>
    );
  }

  render() {
    const { groupData = {} } = this.props;
    const { smallSize } = this.state;
    let sidebar;
    let content;
    if (!smallSize) {
      sidebar = (
        <Nav
          {...this.props.groupData}
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
        <Group
          {...groupData}
          onJoinRequest={this.props.createRequest}
          updates={this.props.groupUpdates}
          onJoin={this.props.joinGroup}
          onLeave={this.props.leaveGroup}
          onDeleteRequest={this.props.deleteRequest}
        />
      );
    }
    return (
      <Box justify={smallSize}>
        {sidebar}
        {content}
      </Box>
    );
  }
}

const mapStateToProps = (state, { id }) => ({
  groupData: getGroup(state, id),
  groupUpdates: getGroupStatus(state),
});

const mapDispatch = {
  loadGroup,
  createRequest,
  joinGroup,
  leaveGroup,
  deleteRequest,
};

export default connect(mapStateToProps, mapDispatch)(GroupContainer);
