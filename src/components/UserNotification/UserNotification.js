import React from 'react';
import PropTypes from 'prop-types';
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
  proposalNew: {
    id: 'notifications.proposal.new',
    defaultMessage: 'New proposal published: {title}',
    description: 'Status message for notifications',
  },
});

class UserNotification extends React.Component {
  static propTypes = {
    activity: PropTypes.shape({}).isRequired,
  };
  static defaultProps = {};

  computeData() {
    const { activity } = this.props;
    const info = JSON.parse(activity.info);
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
              `/proposal/${info.proposalId}/${activity.object.pollId}`,
          };
        }
        return 'To implement';
      case 'proposal': {
        const activePoll = activity.object.polTow || activity.object.pollOne;
        if (activity.verb === 'create') {
          return {
            message: (
              <FormattedMessage
                {...messages.proposalNew}
                values={{ title: activity.object.title }}
              />
            ),
            path: `/proposal/${activity.object.id}/${activePoll.id}`,
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
      <Link to={data.path} className={s.root}>
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
