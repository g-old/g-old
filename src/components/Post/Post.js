// @flow
import React from 'react';
import {
  FormattedRelative,
  FormattedMessage,
  defineMessages,
} from 'react-intl';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Post.css';
import Avatar from '../Avatar';
import Comment from '../Comment';
import Label from '../Label';
import ProposalPreview from '../ProposalPreview';
import DiscussionPreview from '../DiscussionPreview';
import Box from '../Box';

import Link from '../Link';
import history from '../../history';
import { ICONS } from '../../constants';
import Button from '../Button/Button';
import { type tObjectType } from '../../data/types/ObjectType';
import { type tProposalType } from '../../data/types/ProposalDLType';
import { type tVoteType } from '../../data/types/VoteDLType';
import { type tDiscussionType } from '../../data/types/DiscussionType';
import { type tWorkTeam } from '../../data/types/WorkTeamType';

const messages = defineMessages({
  followeeVote: {
    id: 'post.followeeVote',
    defaultMessage: 'Someone you are following voted on this Proposal',
    description:
      'shown as a message on a proposal post that was voted by one or more followees',
  },
});

const langSchema = {
  'de-DE': 'deName',
  'it-IT': 'itName',
  'lld-IT': 'lldName',
};

function getProposalVerb(verb: string, proposal: tProposalType) {
  let state = verb;
  let identifier;

  if (proposal.state === 'update') {
    state = proposal.state // eslint-disable-line
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

type Props = {
  subject: tObjectType,
  group: tWorkTeam,
  info: string,
  verb: string,
  date: string,
  locale: string,
};

class Post extends React.Component<Props> {
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
          <span>
            {info[langSchema[this.props.locale]] || info.name || ':('}
          </span>
        </Button>
        <Label>{title}</Label>
      </Box>
    );
  }
  renderVote(info) {
    const vote: tVoteType = this.props.subject;
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
          stroke={vote.position === 'pro' ? '#8cc800' : '#ff324d'}
          strokeWidth="2"
          d={ICONS.thumbUpAlt}
          transform={
            vote.position === 'pro' ? '' : 'scale(1,-1) translate(0,-24)'
          }
        />
      </svg>
    );
    return (
      <Link // eslint-disable-line
        to={`/proposal/${info.proposalId || 'xxx'}/${vote.pollId}`}
      >
        <div className={s.follower}>
          <span>
            <Avatar user={vote.voter} isFollowee />
            <span>{`${vote.voter.name} ${vote.voter.surname}`}</span>
          </span>

          {thumb}
        </div>
      </Link>
    );
  }

  renderComment(workTeamId) {
    const discussion: tDiscussionType = this.props.subject;
    const parent = discussion.parentId;
    const child = parent ? discussion.id : null;

    return (
      <Link // eslint-disable-line
        to={`/workteams/${workTeamId}/discussions/${
          discussion.discussionId
        }?comment=${parent || discussion.id}${child ? `&child=${child}` : ''}`}
      >
        <Comment preview {...this.props.subject} />
      </Link>
    );
  }

  renderContent() {
    const { subject, verb } = this.props;
    if (!subject) return { header: 'No content' };
    const result = {};
    switch (subject.__typename) { // eslint-disable-line
      case 'ProposalDL': {
        result.content = (
          <ProposalPreview proposal={subject} onClick={this.onProposalClick} />
        );
        let header = getProposalVerb(verb, subject);
        if (subject.workTeamId) {
          const info = JSON.parse(this.props.info || '{}');
          header = this.renderGroupHeader(info, header);
        }
        result.header = header;
        break;
      }

      case 'Discussion': {
        const info = JSON.parse(this.props.info || '{}');
        result.content = (
          <DiscussionPreview
            discussion={subject}
            onClick={() =>
              history.push(
                `/workteams/${info.workTeamId}/discussions/${subject.id}`,
              )
            }
          />
        );

        result.header = this.renderGroupHeader(
          info,
          <FormattedMessage {...messages.newDiscussion} />,
        );
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
        {this.props.date && (
          <div className={s.date}>
            <FormattedRelative value={this.props.date} />
          </div>
        )}
        <div>{header}</div>

        <div>{content}</div>
      </div>
    );
  }
}

export default withStyles(s)(Post);
