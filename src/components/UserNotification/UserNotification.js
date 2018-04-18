import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import {
  defineMessages,
  FormattedMessage,
  FormattedRelative,
} from 'react-intl';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './UserNotification.css';
import Box from '../Box';
import Link from '../Link';

const messages = defineMessages({
  statementNew: {
    id: 'notifications.statement.new',
    defaultMessage: '{author} wrote a statement on {topic} ',
    description: 'Status message for notifications',
  },
  commentNew: {
    id: 'notifications.comment.new',
    defaultMessage: '{author} wrote a comment on {topic} ',
    description: 'Status message for notifications',
  },
  proposalNew: {
    id: 'notifications.proposal.new',
    defaultMessage: 'New proposal published: {title}',
    description: 'Status message for notifications',
  },
  discussionNew: {
    id: 'notifications.discussion.new',
    defaultMessage: 'New discussion published: {title}',
    description: 'Status message for notifications',
  },
  messageNew: {
    id: 'notifications.message.new',
    defaultMessage: 'You got a message from {author}',
    description: 'Status message for notifications',
  },
  voting: {
    id: 'notifications.proposal.voting',
    defaultMessage: 'Voting phase started for {title}',
    description: 'Status message for notifications',
  },
  accepted: {
    id: 'notifications.proposal.accepted',
    defaultMessage: '{title} got accepted!',
    description: 'Status message for notifications',
  },
  rejected: {
    id: 'notifications.proposal.rejected',
    defaultMessage: '{title} was rejected!',
    description: 'Status message for notifications',
  },
});

class UserNotification extends React.Component {
  static propTypes = {
    activity: PropTypes.shape({}).isRequired,
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    read: PropTypes.bool.isRequired,
  };
  static defaultProps = {};

  computeData() {
    const { activity, id } = this.props;
    const info = JSON.parse(activity.info);
    const param = `?ref=notification&id=${id}`;
    switch (activity.type) {
      case 'statement':
        if (activity.verb === 'create') {
          return {
            message: (
              <FormattedMessage
                {...messages.statementNew}
                values={{
                  author: `${activity.actor.name} ${activity.actor.surname}`,
                  topic: info.proposalTitle,
                }}
              />
            ),
            path:
              activity.object &&
              `/proposal/${info.proposalId}/${activity.object.pollId}${param}`,
          };
        }
        return 'To implement';
      case 'proposal': {
        const activePoll = activity.object.pollTow || activity.object.pollOne;
        if (activity.verb === 'create') {
          return {
            message: (
              <FormattedMessage
                {...messages.proposalNew}
                values={{ title: activity.object.title }}
              />
            ),
            path: `/proposal/${activity.object.id}/${activePoll.id}${param}`,
          };
        } else if (activity.verb === 'update') {
          if (activity.object.state) {
            return {
              message: (
                <FormattedMessage
                  {...messages[activity.object.state]}
                  values={{ title: activity.object.title }}
                />
              ),
              path: `/proposal/${activity.object.id}/${activePoll.id}${param}`,
            };
          }
        }
        return 'To implement';
      }
      case 'comment': {
        if (activity.verb === 'create') {
          const parent = activity.object.parentId;
          const child = parent ? activity.object.id : null;
          return {
            message: (
              <FormattedMessage
                {...messages.commentNew}
                values={{
                  author: `${activity.actor.name} ${activity.actor.surname}`,
                  topic: info.title,
                }}
              />
            ),
            path: `/workteams/${info.workTeamId}/discussions/${
              activity.object.discussionId
            }?comment=${parent || activity.object.id}${
              child ? `&child=${child}` : ''
            }&ref=notification&id=${id}`,
          };
        }
        return 'To implement';
      }
      case 'discussion': {
        if (activity.verb === 'create') {
          return {
            message: (
              <FormattedMessage
                {...messages.discussionNew}
                values={{
                  title: activity.object.title,
                }}
              />
            ),
            path: `/workteams/${activity.workTeamId}/discussions/${
              activity.object.id
            }${param}`,
          };
        }
        return 'To implement';
      }
      case 'message': {
        if (activity.verb === 'create') {
          return {
            message: (
              <FormattedMessage
                {...messages.messageNew}
                values={{
                  author: `${activity.actor.name} ${activity.actor.surname}`,
                }}
              />
            ),
            path: `/message/${activity.object.id}${param}`,
          };
        }
        return 'To implement';
      }

      default:
        return <span>Not found</span>;
    }
  }

  render() {
    const { activity } = this.props;
    const data = this.computeData(activity);
    return (
      // eslint-disable-next-line
      <Link
        to={data.path}
        className={cn(s.root, this.props.read ? null : s.unread)}
      >
        <Box pad column>
          <span>
            <img alt="" src={activity.actor.thumbnail} /> {data.message}
          </span>

          <FormattedRelative value={activity.createdAt} />
        </Box>
      </Link>
    );
  }
}

export default withStyles(s)(UserNotification);
