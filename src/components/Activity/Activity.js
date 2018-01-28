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
import Comment from '../Comment';

import ProposalPreview from '../ProposalPreview';
import DiscussionPreview from '../DiscussionPreview';
import Box from '../Box';

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
  newDiscussion: {
    id: 'discussion.new',
    defaultMessage: 'New discussion',
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

const langSchema = {
  'de-DE': 'deName',
  'it-IT': 'itName',
  'lld-IT': 'lldName',
};

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
      workTeamId: PropTypes.string,
      discussionId: PropTypes.string,
    }),
    info: PropTypes.string.isRequired,
    verb: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    locale: PropTypes.string.isRequired,
  };
  static defaultProps = {
    content: {},
  };

  constructor(props) {
    super(props);
    this.renderVote = this.renderVote.bind(this);
    this.renderContent = this.renderContent.bind(this);
    this.renderComment = this.renderComment.bind(this);
  }

  // eslint-disable-next-line class-methods-use-this
  onProposalClick({ proposalId, pollId }) {
    history.push(`/proposal/${proposalId}/${pollId}`);
  }
  renderGroupHeader(info, title) {
    return (
      <Box align pad>
        <div>
          {info.logo ? (
            'IMPLEMENT LOGO'
          ) : (
            <svg
              version="1.1"
              viewBox="0 0 24 24"
              role="img"
              width="48px"
              height="48px"
              aria-label="cloud"
            >
              <path
                fill="none"
                stroke="#000"
                strokeWidth="2"
                d="M18,17 L18,18 C18,21 16,22 13,22 L11,22 C8,22 6,21 6,18 L6,17 C3.23857625,17 1,14.7614237 1,12 C1,9.23857625 3.23857625,7 6,7 L12,7 M6,7 L6,6 C6,3 8,2 11,2 L13,2 C16,2 18,3 18,6 L18,7 C20.7614237,7 23,9.23857625 23,12 C23,14.7614237 20.7614237,17 18,17 L12,17"
              />
            </svg>
          )}{' '}
          <span>
            {info[langSchema[this.props.locale]] || info.name || ':('}
          </span>
        </div>
        {title}
      </Box>
    );
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

  renderComment(workTeamId) {
    const { content } = this.props;
    const parent = content.parentId;
    const child = parent ? content.id : null;

    return (
      <Link
        to={`/workteams/${workTeamId}/discussions/${this.props.content
          .discussionId}?comment=${parent || content.id}${child
          ? `&child=${child}`
          : ''}`}
      >
        <Comment preview {...this.props.content} />
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
        let header = getProposalHeader(verb, content);
        if (content.workTeamId) {
          const info = JSON.parse(this.props.info || '{}');
          header = this.renderGroupHeader(info, header);
        }
        result.header = header;
        break;
      }
      case 'VoteDL': {
        const info = JSON.parse(this.props.info || '{}');

        result.content = this.renderVote(info);
        result.header = info.proposalTitle || ':(';
        break;
      }

      case 'Discussion': {
        const info = JSON.parse(this.props.info || '{}');
        result.content = (
          <DiscussionPreview
            discussion={content}
            onClick={() =>
              history.push(
                `/workteams/${info.workTeamId}/discussions/${content.id}`,
              )}
          />
        );

        result.header = this.renderGroupHeader(
          info,
          <FormattedMessage {...messages.newDiscussion} />,
        );
        break;
      }

      case 'Comment': {
        const info = JSON.parse(this.props.info || '{}');

        result.content = this.renderComment(info.workTeamId);
        result.header = info.title;
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
