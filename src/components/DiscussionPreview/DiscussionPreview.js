import {
  FormattedRelative,
  defineMessages,
  FormattedMessage,
} from 'react-intl';
import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/withStyles';
import Box from '../Box';
import s from './DiscussionPreview.css';
import UserThumbnail from '../UserThumbnail/UserThumbnail';
// import history from '../../history';

const messages = defineMessages({
  numComments: {
    id: 'numComments',
    defaultMessage: '{cnt} comments',
    description: 'Number of comments',
  },
  created: {
    id: 'created',
    defaultMessage: 'posted by {author} {date}',
    description: 'Creation description',
  },
});

class DiscussionPreview extends React.Component {
  static propTypes = {
    discussion: PropTypes.shape({
      author: PropTypes.shape({
        name: PropTypes.string,
        surname: PropTypes.string,
      }).isRequired,
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      createdAt: PropTypes.string,
      numComments: PropTypes.number.isRequired,
      workteamId: PropTypes.string.isRequired,
    }).isRequired,
    onClick: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    const { onClick, discussion } = this.props;
    if (onClick) {
      onClick({
        discussionId: discussion.id,
        workteamId: discussion.workteamId,
      });
    }
  }

  render() {
    const { discussion } = this.props;
    return (
      <Box column padding="small" onClick={this.handleClick}>
        <div>
          <UserThumbnail marked user={discussion.author} />
          <div className={s.date}>
            <FormattedMessage
              {...messages.created}
              values={{
                author: `${discussion.author.name} ${discussion.author.surname}`,
                date: <FormattedRelative value={discussion.createdAt} />,
              }}
            />
          </div>
          <div className={s.header}>{discussion.title}</div>
          <div className={s.footer}>
            <svg width="24px" height="24px" viewBox="0 0 24 24">
              <path
                fill="#666"
                d="M12,23A1,1 0 0,1 11,22V19H7A2,2 0 0,1 5,17V7C5,5.89 5.9,5 7,5H21A2,2 0 0,1 23,7V17A2,2 0 0,1 21,19H16.9L13.2,22.71C13,22.9 12.75,23 12.5,23V23H12M13,17V20.08L16.08,17H21V7H7V17H13M3,15H1V3A2,2 0 0,1 3,1H19V3H3V15Z"
              />
            </svg>
            <FormattedMessage
              {...messages.numComments}
              values={{ cnt: discussion.numComments }}
            />
          </div>
        </div>
      </Box>
    );
  }
}

export default withStyles(s)(DiscussionPreview);
