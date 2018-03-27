import {
  FormattedRelative,
  defineMessages,
  FormattedMessage,
} from 'react-intl';
import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import Box from '../Box';
// import cn from 'classnames';
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
    if (this.props.onClick) {
      this.props.onClick({
        discussionId: this.props.discussion.id,
        workTeamId: this.props.discussion.workTeamId,
      });
    }
  }

  render() {
    const { discussion } = this.props;
    return (
      /* eslint-disable jsx-a11y/no-static-element-interactions */
      /* eslint-disable jsx-a11y/interactive-supports-focus */

      <Box column className={s.root}>
        <div>
          <div className={s.date}>
            <FormattedRelative value={discussion.createdAt} />
          </div>
          <div // eslint-disable-line
            role="link"
            style={{ cursor: 'pointer' }}
            onClick={this.handleClick}
            className={s.header}
          >
            {discussion.title}
          </div>
          <FormattedMessage
            {...messages.numComments}
            values={{ cnt: discussion.numComments }}
          />
        </div>
      </Box>
    );
    /* eslint-enable jsx-a11y/no-static-element-interactions */
  }
}

export default withStyles(s)(DiscussionPreview);
