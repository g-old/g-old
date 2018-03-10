import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { defineMessages, FormattedMessage } from 'react-intl';
import s from './Group.css';
import Heading from '../Heading';
import Value from '../Value';
// import Menu from '../Menu';
import ConfirmLayer from '../ConfirmLayer';
import Box from '../Box';
import Button from '../Button';
import DiscussionPreview from '../DiscussionPreview';
import ProposalPreview from '../ProposalPreview';
import history from '../../history';
import Tabs from '../Tabs';
import Tab from '../Tab';

const messages = defineMessages({
  join: {
    id: 'join',
    defaultMessage: 'Join',
    description: 'Button label',
  },
  withdraw: {
    id: 'join.withdraw',
    defaultMessage: 'Dismiss request',
    description: 'Cancel join request',
  },
  leave: {
    id: 'leave',
    defaultMessage: 'Leave',
    description: 'Leave team',
  },
});

class Group extends React.Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    logo: PropTypes.string,
    displayName: PropTypes.string.isRequired,
    numMembers: PropTypes.number.isRequired,
    numDiscussions: PropTypes.number.isRequired,
    numProposals: PropTypes.number.isRequired,
    discussions: PropTypes.arrayOf(PropTypes.shape({})),
    proposals: PropTypes.arrayOf(PropTypes.shape({})),
    ownStatus: PropTypes.shape({
      status: PropTypes.oneOf(['NONE', 'MEMBER', 'PENDING']),
    }).isRequired,
    onJoinRequest: PropTypes.func.isRequired,
    updates: PropTypes.shape({ pending: PropTypes.bool }).isRequired,
    restricted: PropTypes.bool.isRequired,
    onJoin: PropTypes.func.isRequired,
    onLeave: PropTypes.func.isRequired,
    onDeleteRequest: PropTypes.func.isRequired,
  };
  static defaultProps = {
    logo: null,
    discussions: null,
    proposals: null,
  };
  static onProposalClick({ proposalId, pollId }) {
    history.push(`/proposal/${proposalId}/${pollId}`);
  }

  constructor(props) {
    super(props);
    this.handleDiscussionClick = this.handleDiscussionClick.bind(this);
    this.handleJoining = this.handleJoining.bind(this);
    this.cancelJoining = this.cancelJoining.bind(this);
    this.renderActionButton = this.renderActionButton.bind(this);
    this.onOpenLayer = this.onOpenLayer.bind(this);
    this.onCloseLayer = this.onCloseLayer.bind(this);
    this.onLeave = this.onLeave.bind(this);
    this.state = { showLayer: false };
  }

  onOpenLayer() {
    this.setState({ showLayer: true });
  }

  onCloseLayer() {
    this.setState({ showLayer: false });
  }

  onLeave(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const { ownStatus = {}, id } = this.props;
    if (ownStatus !== 'NONE') {
      this.props.onLeave({ id }).then(() => this.onCloseLayer());
    }
  }

  // eslint-disable-next-line class-methods-use-this
  handleDiscussionClick({ discussionId }) {
    history.push(`${this.props.id}/discussions/${discussionId}`);
  }

  handleJoining() {
    const { ownStatus = {}, id, onJoin } = this.props;
    if (ownStatus.status === 'NONE') {
      onJoin({ id });
    }
  }

  // eslint-disable-next-line class-methods-use-this
  cancelJoining() {
    const { ownStatus = {} } = this.props;
    if (ownStatus.status !== 'NONE') {
      this.onOpenLayer();
      // this.props.onLeave({ id });
    }
  }

  renderActionButton(status, updates) {
    let label;
    let action;
    const props = {};
    switch (status) {
      case 'NONE': {
        label = 'join';
        props.primary = true;
        action = this.handleJoining;
        break;
      }
      case 'PENDING': {
        label = 'withdraw';
        action = this.cancelJoining;
        break;
      }
      case 'MEMBER': {
        label = 'leave';
        action = this.cancelJoining;
        break;
      }

      default: {
        console.error(`Status not recognized: ${status}`);
      }
    }

    return (
      <Button
        disabled={updates.pending}
        onClick={action}
        {...props}
        label={<FormattedMessage {...messages[label]} />}
      />
    );
  }

  render() {
    const {
      logo,
      displayName,
      numMembers,
      numDiscussions,
      numProposals,
      proposals = [],
      discussions = [],
      ownStatus = {},
      updates = {},
    } = this.props;
    let picture;
    if (logo) {
      picture = <img alt="Logo" className={s.logo} src={logo} />;
    } else {
      picture = (
        <svg
          className={s.logo}
          version="1.1"
          viewBox="0 0 24 24"
          role="img"
          width="100px"
          height="100px"
          aria-label="cloud"
        >
          <path
            fill="none"
            stroke="#000"
            strokeWidth="2"
            d="M18,17 L18,18 C18,21 16,22 13,22 L11,22 C8,22 6,21 6,18 L6,17 C3.23857625,17 1,14.7614237 1,12 C1,9.23857625 3.23857625,7 6,7 L12,7 M6,7 L6,6 C6,3 8,2 11,2 L13,2 C16,2 18,3 18,6 L18,7 C20.7614237,7 23,9.23857625 23,12 C23,14.7614237 20.7614237,17 18,17 L12,17"
          />
        </svg>
      );
    }

    let actionBtn;
    if (ownStatus.status) {
      actionBtn = this.renderActionButton(ownStatus.status, updates);
    }

    let discussionSection;
    let proposalsSection;
    if (ownStatus.status === 'MEMBER') {
      discussionSection = (
        <div className={s.discussions}>
          {discussions.map(
            d =>
              d && (
                <DiscussionPreview
                  discussion={d}
                  onClick={this.handleDiscussionClick}
                />
              ),
          )}
        </div>
      );
      proposalsSection = (
        <div>
          {proposals.map(
            p =>
              p && (
                <ProposalPreview
                  proposal={p}
                  onClick={Group.onProposalClick}
                />
              ),
          )}
        </div>
      );
    }
    let layer;
    if (this.state.showLayer) {
      layer = (
        <ConfirmLayer
          onClose={this.onCloseLayer}
          onSubmit={this.onLeave}
          action="leave"
        />
      );
    }
    return (
      <Box align column padding="medium" pad>
        {picture}
        <Heading tag="h2">{displayName}</Heading>
        <Box>
          <Value
            icon={
              <svg viewBox="0 0 24 24" width="24px" height="24px" role="img">
                <path
                  fill="none"
                  stroke="#000"
                  strokeWidth="2"
                  d="M12,13 C14.209139,13 16,11.209139 16,9 C16,6.790861 14.209139,5 12,5 C9.790861,5 8,6.790861 8,9 C8,11.209139 9.790861,13 12,13 Z M6,22 L6,19 C6,15.6862915 8.6862915,13 12,13 C15.3137085,13 18,15.6862915 18,19 L18,22 M13,5 C13.4037285,3.33566165 15.0151447,2 17,2 C19.172216,2 20.98052,3.790861 21,6 C20.98052,8.209139 19.172216,10 17,10 L16,10 L17,10 C20.287544,10 23,12.6862915 23,16 L23,18 M11,5 C10.5962715,3.33566165 8.98485529,2 7,2 C4.82778404,2 3.01948003,3.790861 3,6 C3.01948003,8.209139 4.82778404,10 7,10 L8,10 L7,10 C3.71245602,10 1,12.6862915 1,16 L1,18"
                />
              </svg>
            }
            label="Members"
            value={numMembers || 0}
          />

          <Value
            icon={
              <svg viewBox="0 0 24 24" width="24px" height="24px" role="img">
                <path
                  fill="none"
                  stroke="#000"
                  strokeWidth="2"
                  d="M12,13 C14.209139,13 16,11.209139 16,9 C16,6.790861 14.209139,5 12,5 C9.790861,5 8,6.790861 8,9 C8,11.209139 9.790861,13 12,13 Z M6,22 L6,19 C6,15.6862915 8.6862915,13 12,13 C15.3137085,13 18,15.6862915 18,19 L18,22 M13,5 C13.4037285,3.33566165 15.0151447,2 17,2 C19.172216,2 20.98052,3.790861 21,6 C20.98052,8.209139 19.172216,10 17,10 L16,10 L17,10 C20.287544,10 23,12.6862915 23,16 L23,18 M11,5 C10.5962715,3.33566165 8.98485529,2 7,2 C4.82778404,2 3.01948003,3.790861 3,6 C3.01948003,8.209139 4.82778404,10 7,10 L8,10 L7,10 C3.71245602,10 1,12.6862915 1,16 L1,18"
                />
              </svg>
            }
            label="Discussions"
            value={numDiscussions || 0}
          />
          <Value
            icon={
              <svg
                version="1.1"
                viewBox="0 0 24 24"
                width="24px"
                height="24px"
                role="img"
                aria-label="proposal"
              >
                <path
                  fill="none"
                  stroke="#000"
                  strokeWidth="2"
                  d="M16,7 L19,7 L19,11 L16,11 L16,7 Z M9,15 L20,15 M9,11 L13,11 M9,7 L13,7 M6,18.5 C6,19.8807119 4.88071187,21 3.5,21 C2.11928813,21 1,19.8807119 1,18.5 L1,7 L6.02493781,7 M6,18.5 L6,3 L23,3 L23,18.5 C23,19.8807119 21.8807119,21 20.5,21 L3.5,21"
                />
              </svg>
            }
            label="Proposals"
            value={numProposals || 0}
          />
          <Box />
        </Box>
        {/* <Button
          onClick={() => {
            history.push(`/workteams/${id}/admin`);
          }}
          primary
          label={'Management'}
        /> */}
        {actionBtn}
        <section>
          <Tabs>
            <Tab title="Votings">
              <div>{proposalsSection}</div>
            </Tab>
            <Tab title="Discussions">
              <div>{discussionSection}</div>
            </Tab>
          </Tabs>
        </section>
        {layer}
      </Box>
    );
  }
}

export default withStyles(s)(Group);
