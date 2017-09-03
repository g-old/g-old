import React from 'react';
import PropTypes from 'prop-types';
import { FormattedRelative } from 'react-intl';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cn from 'classnames';
import s from './ActivityLog.css';
import Avatar from '../Avatar';
import Statement from '../Statement';
import { ICONS } from '../../constants';
import Link from '../Link';

class ActivityLog extends React.Component {
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
      msg: PropTypes.string,
      title: PropTypes.string,
      position: PropTypes.string,
    }),
    date: PropTypes.string.isRequired,
    verb: PropTypes.string.isRequired,
  };
  static defaultProps = {
    content: {},
  };

  render() {
    /* eslint-disable no-underscore-dangle */
    const { content, verb, date } = this.props;
    const type = content && content.__typename;
    if (!type) {
      return (
        <div>
          {'FAILURE'}
        </div>
      );
    }
    let activity = null;
    switch (type) {
      case 'StatementDL': {
        const obj = Object.assign({}, content, {
          vote: {
            position: content.position,
            id: content.voteId,
          },
        });
        activity = (
          <Link to={`/proposal/xxx/${content.pollId}`}>
            <Statement {...obj} />
          </Link>
        );
        break;
      }

      case 'VoteDL': {
        let displayVote;
        if (verb === 'update') {
          displayVote = (
            <span>
              <svg
                viewBox="0 0 24 24"
                width="60px"
                height="24px"
                role="img"
                aria-label="halt"
              >
                <path
                  fill="none"
                  stroke={content.position !== 'pro' ? '#8cc800' : '#ff324d'}
                  strokeWidth="1"
                  d={ICONS.thumbUpAlt}
                  transform={
                    content.position !== 'pro' ? '' : 'rotate(180 12 12)'
                  }
                />
              </svg>
              TO{' '}
              <svg
                viewBox="0 0 24 24"
                width="60px"
                height="24px"
                role="img"
                aria-label="halt"
              >
                <path
                  fill="none"
                  stroke={content.position === 'pro' ? '#8cc800' : '#ff324d'}
                  strokeWidth="1"
                  d={ICONS.thumbUpAlt}
                  transform={
                    content.position === 'pro' ? '' : 'rotate(180 12 12)'
                  }
                />
              </svg>
            </span>
          );
        } else {
          displayVote = (
            <svg
              viewBox="0 0 24 24"
              width="60px"
              height="24px"
              role="img"
              aria-label="halt"
            >
              <path
                fill="none"
                stroke={content.position === 'pro' ? '#8cc800' : '#ff324d'}
                strokeWidth="1"
                d={ICONS.thumbUpAlt}
                transform={
                  content.position === 'pro' ? '' : 'rotate(180 12 12)'
                }
              />
            </svg>
          );
        }
        activity = (
          <Link to={`/proposal/xxx/${content.pollId}`}>
            <div>
              <Avatar user={content.voter} />
              {`${content.voter.name} ${content.voter.surname}`}

              {displayVote}
            </div>
          </Link>
        );
        break;
      }
      case 'Notification': {
        activity = (
          <div>
            <h3>
              {content.title}
            </h3>
            {content.msg}
          </div>
        );
        break;
      }

      default: {
        activity = (
          <div>
            {'TYPE NOT RECOGNIZED'}
          </div>
        );
      }
    }

    /* eslint-enable no-underscore-dangle */

    return (
      <div
        className={cn(
          s.container,
          type === 'Notification' ? s.notification : null,
          verb === 'delete' ? s.deleted : null,
        )}
      >
        <FormattedRelative value={date} />

        <div>
          {activity}
        </div>
      </div>
    );
  }
}

export default withStyles(s)(ActivityLog);
