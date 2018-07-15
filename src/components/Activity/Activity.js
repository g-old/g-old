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
import Label from '../Label';
import ProposalPreview from '../ProposalPreview';
import DiscussionPreview from '../DiscussionPreview';
import Notification from '../Notification';
import Box from '../Box';

import Link from '../Link';
import history from '../../history';
import { ICONS } from '../../constants';
import Button from '../Button/Button';

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
    defaultMessage: 'Rejected',
    description: 'Proposal got rejected',
  },
  revoked: {
    id: 'proposal.revoked',
    defaultMessage: 'Revoked',
    description: 'Proposal was revoked',
  },
  closed: {
    id: 'survey.closed',
    description: 'Survey closed',
    defaultMessage: 'Closed!',
  },
  voteRequest: {
    id: 'proposal.votingRequested',
    description: 'Poll reached its limit',
    defaultMessage: 'Voting requested!',
  },
});

const langSchema = {
  'de-DE': 'deName',
  'it-IT': 'itName',
  'lld-IT': 'lldName',
};

function renderGroupHeader(info, title, locale) {
  return (
    <Box align between className={s.groupHeader}>
      <Button
        plain
        onClick={() => history.push(`/workteams/${info.workTeamId}`)}
      >
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
              d={ICONS.workteam}
            />
          </svg>
        )}
        <span>{info[langSchema[locale]] || info.name || ':('}</span>
      </Button>
      <Label>{title}</Label>
    </Box>
  );
}

function getProposalHeader(verb, proposal) {
  let state = verb;
  let identifier;
  if (verb === 'update') {
    state = proposal.state; // eslint-disable-line
  }
  switch (state) {
    case 'create': {
      const isSurvey = proposal.state === 'survey';
      identifier = isSurvey ? 'newSurvey' : 'newProposal';
      break;
    }
    case 'proposed': {
      identifier = 'voteRequest';
      break;
    }
    case 'survey': {
      identifier = 'closed';
      break;
    }

    case 'accept': {
      identifier = 'proposalFailed';
      break;
    }
    case 'accepted': {
      identifier = 'proposalValid';
      break;
    }
    case 'rejected': {
      identifier = 'proposalFailed';
      break;
    }
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

  renderVote(info) {
    const {
      content: { position, pollId, voter },
    } = this.props;
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
          stroke={position === 'pro' ? '#8cc800' : '#ff324d'}
          strokeWidth="2"
          d={ICONS.thumbUpAlt}
          transform={position === 'pro' ? '' : 'scale(1,-1) translate(0,-24)'}
        />
      </svg>
    );
    return (
      <Link // eslint-disable-line
        to={`/proposal/${info.proposalId || 'xxx'}/${pollId}`}
      >
        <div className={s.follower}>
          <span>
            <Avatar user={voter} isFollowee />
            <span>{`${voter.name} ${voter.surname}`}</span>
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
      <Link // eslint-disable-line
        to={`/workteams/${workTeamId}/discussions/${
          content.discussionId
        }?comment=${parent || content.id}${child ? `&child=${child}` : ''}`}
      >
        <Comment preview {...content} />
      </Link>
    );
  }

  renderContent() {
    const { content, verb, locale, info } = this.props;
    if (!content) return { header: 'No content' };
    const result = {};
    const infoData = JSON.parse(info || '{}');
    switch (
      content.__typename // eslint-disable-line
    ) {
      case 'StatementDL': {
        result.content = (
          <Link // eslint-disable-line
            to={`/proposal/${infoData.proposalId || 'xxx'}/${content.pollId}`}
          >
            <Statement {...content} />
          </Link>
        );

        result.header = infoData.proposalTitle || ':(';
        break;
      }
      case 'ProposalDL': {
        result.content = content.deletedAt ? (
          <Notification type="alert" message="Proposal not accessible" />
        ) : (
          <ProposalPreview proposal={content} onClick={this.onProposalClick} />
        );
        let header = getProposalHeader(verb, content);
        if (content.workTeamId) {
          header = renderGroupHeader(infoData, header, locale);
        }
        result.header = header;
        break;
      }
      case 'VoteDL': {
        result.content = this.renderVote(infoData);
        result.header = infoData.proposalTitle || ':(';
        break;
      }

      case 'Discussion': {
        result.content = content.deletedAt ? (
          <Notification type="alert" message="Discussion not accessible" />
        ) : (
          <DiscussionPreview
            discussion={content}
            onClick={() =>
              history.push(
                `/workteams/${infoData.workTeamId}/discussions/${content.id}`,
              )
            }
          />
        );

        result.header = renderGroupHeader(
          infoData,
          <FormattedMessage {...messages.newDiscussion} />,
          locale,
        );
        break;
      }

      case 'Comment': {
        result.content = this.renderComment(infoData.workTeamId);
        result.header = infoData.title;
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
    const { date } = this.props;
    return (
      <div className={s.container}>
        <div className={s.date}>
          <FormattedRelative value={date} />
        </div>
        <div>{header}</div>

        <div>{content}</div>
      </div>
    );
  }
}

export default withStyles(s)(Activity);
