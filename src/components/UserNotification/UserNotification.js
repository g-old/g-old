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
import Link from '../Link';

const messages = defineMessages({
  statementNew: {
    id: 'notifications.statement.new',
    defaultMessage: 'wrote a statement on',
    description: 'Status message for notifications',
  },
  commentNew: {
    id: 'notifications.comment.new',
    defaultMessage: 'wrote a comment on',
    description: 'Status message for notifications',
  },
  proposalNew: {
    id: 'notifications.proposal.new',
    defaultMessage: 'New proposal published: ',
    description: 'Status message for notifications',
  },
  surveyNew: {
    id: 'notifications.survey.new',
    defaultMessage: 'New survey published: ',
    description: 'Status message for notifications',
  },
  surveyClosed: {
    id: 'notifications.survey.closed',
    defaultMessage: 'was closed',
    description: 'Status message for notifications',
  },
  discussionNew: {
    id: 'notifications.discussion.new',
    defaultMessage: 'New discussion published:',
    description: 'Status message for notifications',
  },
  messageNew: {
    id: 'notifications.message.new',
    defaultMessage: 'You got a message from',
    description: 'Status message for notifications',
  },
  voting: {
    id: 'notifications.proposal.voting',
    defaultMessage: 'opened voting phase!',
    description: 'Status message for notifications',
  },
  accepted: {
    id: 'notifications.proposal.accepted',
    defaultMessage: 'got accepted!',
    description: 'Status message for notifications',
  },
  rejected: {
    id: 'notifications.proposal.rejected',
    defaultMessage: 'was rejected!',
    description: 'Status message for notifications',
  },
  proposed: {
    id: 'notifications.proposal.proposed',
    defaultMessage: 'was proposed!',
    description: 'Status message for notifications',
  },
  revoked: {
    id: 'notifications.proposal.revoked',
    defaultMessage: 'was revoked!',
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
    let message = '';
    let path = '';
    let thumbnail = '/tile.png';
    // console.log('ACtivity', { activity });
    switch (activity.type) {
      case 'statement': {
        if (activity.verb === 'create') {
          message = (
            <React.Fragment>
              <span className={s.important}>
                {`${activity.actor.name} ${activity.actor.surname}`}
              </span>{' '}
              <FormattedMessage {...messages.statementNew} />{' '}
              <span className={s.important}>{info && info.proposalTitle}</span>
            </React.Fragment>
          );
          path =
            activity.object &&
            `/proposal/${info && info.proposalId}/${
              activity.object.pollId
            }${param}`;
          ({ thumbnail } = activity.actor);
        }
        break;
      }
      case 'proposal': {
        const activePoll = activity.object.pollTwo || activity.object.pollOne;
        if (activity.verb === 'create') {
          message = (
            <React.Fragment>
              <FormattedMessage
                {...messages[
                  activity.object.state === 'survey'
                    ? 'surveyNew'
                    : 'proposalNew'
                ]}
              />{' '}
              <span className={s.important}>{activity.object.title}</span>
            </React.Fragment>
          );
          path = `/proposal/${activity.object.id}/${activePoll.id}${param}`;
        } else if (activity.verb === 'update') {
          if (activity.object.state) {
            message = (
              <React.Fragment>
                <span className={s.important}>{activity.object.title}</span>{' '}
                <FormattedMessage
                  {...messages[
                    activity.object.state === 'survey'
                      ? 'surveyClosed'
                      : activity.object.state
                  ]}
                />
              </React.Fragment>
            );
            path = `/proposal/${activity.object.id}/${activePoll.id}${param}`;
          }
        }
        break;
      }
      case 'comment': {
        if (activity.verb === 'create') {
          if (!activity.object) {
            return { message: 'No object', path: '' };
          }
          const parent = activity.object.parentId;
          const child = parent ? activity.object.id : null;
          path = activity.actor.thumbnail;
          ({ thumbnail } = activity.actor);
          message = (
            <React.Fragment>
              <span className={s.important}>
                {`${activity.actor.name} ${activity.actor.surname}`}
              </span>{' '}
              <FormattedMessage {...messages.commentNew} />{' '}
              <span className={s.important}>{info && info.title}</span>
            </React.Fragment>
          );
          path = `/workteams/${info.workTeamId}/discussions/${
            activity.object.discussionId
          }?comment=${parent || activity.object.id}${
            child ? `&child=${child}` : ''
          }&ref=notification&id=${id}`;
        }
        break;
      }
      case 'discussion': {
        if (activity.verb === 'create') {
          message = (
            <FormattedMessage
              {...messages.discussionNew}
              values={{
                title: activity.object.title,
              }}
            />
          );
          path = `/workteams/${activity.workTeamId}/discussions/${
            activity.object.id
          }${param}`;
        }
        break;
      }
      case 'message': {
        if (activity.verb === 'create') {
          message = (
            <React.Fragment>
              <FormattedMessage {...messages.messageNew} />{' '}
              <span className={s.important}>{`${activity.actor.name} ${
                activity.actor.surname
              }`}</span>
            </React.Fragment>
          );
          path = `/message/${activity.object.id}${param}`;
        }

        break;
      }

      default:
        return <span>Not found</span>;
    }
    return {
      message,
      path,
      thumbnail,
    };
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
        <div className={s.container}>
          <div>
            <img alt="" src={data.thumbnail || '/tile.png'} />
          </div>
          <div className={s.content}>
            <span>{data.message}</span>
            <div className={s.date}>
              <FormattedRelative value={activity.createdAt} />
            </div>
          </div>
        </div>
      </Link>
    );
  }
}

export default withStyles(s)(UserNotification);
