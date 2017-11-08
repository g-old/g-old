import {
  FormattedRelative,
  defineMessages,
  FormattedMessage,
} from 'react-intl';
import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
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
    }).isRequired,
    onClick: PropTypes.func.isRequired,
  };
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    if (this.props.onClick) {
      alert('TO IMPLEMENT');
    }
  }

  render() {
    const { discussion } = this.props;
    return (
      /* eslint-disable jsx-a11y/no-static-element-interactions */
      /* eslint-disable jsx-a11y/interactive-supports-focus */

      <div className={s.root}>
        <div className={s.container}>
          <div style={{ display: 'flex' }}>
            <div style={{ paddingLeft: '1em' }}>
              <div className={s.date}>
                <FormattedRelative value={discussion.createdAt} />
              </div>
              <div
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
          </div>
        </div>
      </div>
    );
    /* eslint-enable jsx-a11y/no-static-element-interactions */
  }
}

export default withStyles(s)(DiscussionPreview);
