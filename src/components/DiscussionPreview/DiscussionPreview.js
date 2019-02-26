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
// import history from '../../history';

const messages = defineMessages({
  numComments: {
    id: 'numComments',
    defaultMessage: '{cnt} comments',
    description: 'Number of comments',
  },
});

class DiscussionPreview extends React.Component {
  static propTypes = {
    discussion: PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      createdAt: PropTypes.string,
      numComments: PropTypes.number.isRequired,
      workTeamId: PropTypes.string.isRequired,
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
        workTeamId: discussion.workTeamId,
      });
    }
  }

  render() {
    const { discussion } = this.props;

    return (
      <Box column onClick={this.handleClick}>
        <div>
          <div className={s.date}>
            <FormattedRelative value={discussion.createdAt} />
          </div>
          <div className={s.header}>{discussion.title}</div>
          <FormattedMessage
            {...messages.numComments}
            values={{ cnt: discussion.numComments }}
          />
        </div>
      </Box>
    );
  }
}

export default withStyles(s)(DiscussionPreview);
