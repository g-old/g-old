import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedRelative,
  FormattedMessage,
  defineMessages,
} from 'react-intl';
import withStyles from 'isomorphic-style-loader/withStyles';
import cn from 'classnames';
import s from './ActivityLog.css';
import UserThumbnail from '../UserThumbnail';
import Label from '../Label';
import Avatar from '../Avatar';
import Statement from '../Statement';
import { ICONS } from '../../constants';
import Link from '../Link';
import Comment from '../Comment';
import Box from '../Box';

const messages = defineMessages({
  joinWT: {
    id: 'request.join.title',
    defaultMessage: 'Request to join a workteam',
    description: 'Label for logs',
  },
  changeEmail: {
    id: 'request.email.title',
    defaultMessage: 'Request to change my email address',
    description: 'Label for logs',
  },
});

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
    info: PropTypes.string.isRequired,
  };

  static defaultProps = {
    content: {},
  };

  render() {
    /* eslint-disable no-underscore-dangle */
    const { content, verb, date } = this.props;
    const type = content && content.__typename;
    if (!type) {
      return <div>FAILURE</div>;
    }
    let activity = null;
    switch (type) {
      case 'StatementDL': {
        const obj = Object.assign({}, content, {
          vote: {
            positions: content.vote.positions,
            id: content.vote.id,
          },
        });
        activity = ( // eslint-disable-next-line
          <Link to={`/proposal/xxx/${content.pollId}`}>
            <Statement {...obj} />
          </Link>
        );
        break;
      }

      case 'VoteDL': {
        let displayVote;
        const { info } = this.props;
        const infoData = JSON.parse(info);
        if (infoData.extended) {
          if (verb === 'create' || infoData.positionAdded) {
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
                    stroke="#8cc800"
                    strokeWidth="1"
                    d={ICONS.thumbUpAlt}
                  />
                </svg>{' '}
                +1
              </span>
            );
          } else {
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
                    stroke="#ff324d"
                    strokeWidth="1"
                    d={ICONS.thumbUpAlt}
                  />
                </svg>{' '}
                -1
              </span>
            );
          }
        } else if (verb === 'update') {
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
                  stroke={
                    content.positions[0].pos !== 0 ? '#8cc800' : '#ff324d'
                  }
                  strokeWidth="1"
                  d={ICONS.thumbUpAlt}
                  transform={
                    content.positions[0].pos !== 0 ? '' : 'rotate(180 12 12)'
                  }
                />
              </svg>
              <svg
                version="1.1"
                viewBox="0 0 24 24"
                width="24px"
                height="24px"
                role="img"
                aria-label="link next"
              >
                <path
                  fill="none"
                  stroke="#666"
                  strokeWidth="2"
                  d="M2,12 L22,12 M13,3 L22,12 L13,21"
                />
              </svg>
              <svg
                viewBox="0 0 24 24"
                width="60px"
                height="24px"
                role="img"
                aria-label="halt"
              >
                <path
                  fill="none"
                  stroke={
                    content.positions[0].pos === 0 ? '#8cc800' : '#ff324d'
                  }
                  strokeWidth="1"
                  d={ICONS.thumbUpAlt}
                  transform={
                    content.positions[0].pos === 0 ? '' : 'rotate(180 12 12)'
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
                  content.position === 'pro'
                    ? ''
                    : 'scale(1,-1) translate(0,-24)'
                }
              />
            </svg>
          );
        }
        activity = (
          // eslint-disable-next-line
          <Link to={`/proposal/xxx/${content.pollId}`}>
            <span style={{ display: 'flex', justifyContent: 'space-between' }}>
              {content.voter && <Avatar user={content.voter} />}
              {displayVote}
            </span>
          </Link>
        );
        break;
      }
      case 'Message': {
        activity = (
          <div>
            <Label>{`Subject: ${content.subject}`}</Label>
            <div>
              <div>Recipients: </div>
              {content.recipients.map(recipient => (
                <UserThumbnail user={recipient} marked={false} />
              ))}
            </div>
          </div>
        );
        break;
      }

      case 'Comment': {
        activity = <Comment preview {...content} />;
        break;
      }
      case 'User': {
        const { info } = this.props;
        const infoData = JSON.parse(info);
        activity = (
          <Box align>
            <UserThumbnail user={content} marked={false} />{' '}
            <span>
              {`${infoData.added ? 'added to' : 'removed from'} ${
                infoData.diff
              }`}
            </span>
          </Box>
        );
        break;
      }

      case 'Request': {
        activity = (
          <div>
            <FormattedMessage {...messages[content.type]} />
          </div>
        );
        break;
      }

      default: {
        activity = <div>{`TYPE NOT RECOGNIZED: ${type}`}</div>;
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

        <div>{activity}</div>
      </div>
    );
  }
}

export default withStyles(s)(ActivityLog);
