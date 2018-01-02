import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedRelative,
  FormattedMessage,
  defineMessages,
} from 'react-intl';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Activity.css';
import Avatar from '../Avatar';
import Statement from '../Statement';
import ProposalPreview from '../ProposalPreview';
import Link from '../Link';
import history from '../../history';
import { ICONS } from '../../constants';

const messages = defineMessages({
  newSurvey: {
    id: 'survey.new',
    defaultMessage: 'New survey',
    description: 'Title for activity',
  },
  newProposal: {
    id: 'proposal.new',
    defaultMessage: 'New proposal',
    description: 'Title for activity',
  },
  proposalFailed: {
    id: 'proposal.failed',
    defaultMessage: 'Failed!',
    description: 'Votation against proposal',
  },
  proposalValid: {
    id: 'proposal.valid',
    defaultMessage: 'Proposal accepted!',
    description: 'Proposal turned valid',
  },
  voting: {
    id: 'proposal.voting',
    defaultMessage: 'Voting open',
    description: 'Proposal can be voted from now on',
  },
  rejected: {
    id: 'proposal.rejected',
    defaultMessage: 'Voting open',
    description: 'Proposal can be voted from now on',
  },
  revoked: {
    id: 'proposal.revoked',
    defaultMessage: 'Revoked',
    description: 'Proposal was revoked',
  },
});

function getProposalHeader(verb, proposal) {
  let state = verb;
  let identifier;

  if (proposal.state === 'update') {
    state = proposal.state;
  }
  switch (state) {
    case 'create': {
      const isSurvey = proposal.state === 'survey';
      identifier = isSurvey ? 'newSurvey' : 'newProposal';
      break;
    }
    case 'accepted':
    case 'accept': {
      identifier = 'proposalFailed';
      break;
    }
    case 'rejected':
    case 'reject': {
      identifier = 'proposalValid';
      break;
    }
    case 'voting': {
      identifier = 'voting';
      break;
    }
    case 'revoked': {
      identifier = 'revoked';
      break;
    }

    default:
      identifier = undefined;
  }

  return identifier ? <FormattedMessage {...messages[identifier]} /> : '';
}

class Activity extends React.Component {
  static propTypes = {
    content: PropTypes.shape({
      __typename: PropTypes.string,
      voter: PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        surname: PropTypes.string,
      }),
      state: PropTypes.string,
      pollId: PropTypes.string,
      position: PropTypes.string,
    }),
    info: PropTypes.string.isRequired,
    verb: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
  };
  static defaultProps = {
    content: {},
  };

  constructor(props) {
    super(props);
    this.renderVote = this.renderVote.bind(this);
    this.renderContent = this.renderContent.bind(this);
  }

  // eslint-disable-next-line class-methods-use-this
  onProposalClick({ proposalId, pollId }) {
    history.push(`/proposal/${proposalId}/${pollId}`);
  }

  renderVote(info) {
    const { position } = this.props.content;
    const thumb = (
      <svg
        viewBox="0 0 24 24"
        width="60px"
        height="24px"
        role="img"
        aria-label="halt"
      >
        <path
          fill="none"
          stroke={this.props.content.position === 'pro' ? '#8cc800' : '#ff324d'}
          strokeWidth="2"
          d={ICONS.thumbUpAlt}
          transform={position === 'pro' ? '' : 'scale(1,-1) translate(0,-24)'}
        />
      </svg>
    );
    return (
      <Link
        to={`/proposal/${info.proposalId || 'xxx'}/${this.props.content
          .pollId}`}
      >
        <div className={s.follower}>
          <span>
            <Avatar user={this.props.content.voter} isFollowee />
            <span>
              {`${this.props.content.voter.name} ${this.props.content.voter
                .surname}`}
            </span>
          </span>

          {thumb}
        </div>
      </Link>
    );
  }

  renderContent() {
    const { content, verb } = this.props;
    if (!content) return { header: 'No content' };
    const result = {};
    switch (content.__typename) { // eslint-disable-line
      case 'StatementDL': {
        const info = JSON.parse(this.props.info || '{}');

        result.content = (
          <Link to={`/proposal/${info.proposalId || 'xxx'}/${content.pollId}`}>
            <Statement {...content} />
          </Link>
        );

        result.header = info.proposalTitle || ':(';
        break;
      }
      case 'ProposalDL': {
        result.content = (
          <ProposalPreview proposal={content} onClick={this.onProposalClick} />
        );
        result.header = getProposalHeader(verb, content);
        break;
      }
      case 'VoteDL': {
        const info = JSON.parse(this.props.info || '{}');

        result.content = this.renderVote(info);
        result.header = info.proposalTitle || ':(';
        break;
      }

      default: {
        return { header: 'Unknown error' };
      }
    }
    return result;
  }

  render() {
    const { header, content } = this.renderContent();

    return (
      <div className={s.container}>
        <div className={s.date}>
          <FormattedRelative value={this.props.date} />
        </div>
        <div className={s.header}>{header}</div>

        <div>{content}</div>
      </div>
    );
  }
}

export default withStyles(s)(Activity);
