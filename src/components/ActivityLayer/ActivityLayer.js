import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { FormattedDate } from 'react-intl';
import s from './ActivityLayer.css';
import Box from '../Box';
import Layer from '../Layer';
import UserThumbnail from '../UserThumbnail';
import GroupThumbnail from '../GroupThumbnail';

const getRequestStatus = ({ deniedAt, processor }) => {
  if (deniedAt) {
    return 'DENIED';
  }

  return processor ? 'ACCEPTED' : 'PENDING';
};

class ActivityLayer extends React.Component {
  static propTypes = {
    object: PropTypes.shape({}),
    verb: PropTypes.oneOf(['update', 'delete', 'create']).isRequired,
    info: PropTypes.string,
    actor: PropTypes.shape({}).isRequired,
    type: PropTypes.oneOf([
      'user',
      'proposal',
      'statement',
      'vote',
      'like',
      'request',
      'discussion',
      'comment',
    ]).isRequired,
    createdAt: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
  };

  static defaultProps = {
    object: null,
    info: null,
  };

  renderActivity() {
    const { object, verb, info, actor, type, createdAt } = this.props;

    const dataObject = object || {};

    let title;
    const infoData = JSON.parse(info || '{}');
    const details = [];
    details.push(
      <div className={s.data}>
        <span className={s.key}>Actor</span>
        <UserThumbnail user={actor} />
      </div>,
      <div className={s.data}>
        <span className={s.key}>Date</span>
        <FormattedDate
          day="numeric"
          month="numeric"
          year="numeric"
          hour="numeric"
          minute="numeric"
          second="numeric"
          value={createdAt}
        />
      </div>,
    );

    switch (verb) {
      case 'create': {
        details.push(
          <div className={s.data}>
            <span className={s.key}>Action</span>
            <span> {'CREATE'}</span>
          </div>,
        );

        break;
      }
      case 'update': {
        details.push(
          <div className={s.data}>
            <span className={s.key}>Action</span>
            <span> {'UPDATE'}</span>
          </div>,
        );

        break;
      }
      case 'delete': {
        details.push(
          <div className={s.data}>
            <span className={s.key}>Action</span>
            <span> {'DELETE'}</span>
          </div>,
        );

        break;
      }

      default:
        break;
    }
    switch (type) {
      case 'message': {
        let recipients;
        if (object) {
          recipients =
            object.recipientType === 'USER'
              ? object.recipients.map(r => <UserThumbnail user={r} />)
              : object.recipients.map(g => <GroupThumbnail group={g} />);
        }

        title = 'Message';
        details.push(
          <div className={s.data}>
            <span className={s.key}>Sender</span>
            <UserThumbnail user={dataObject.sender} />
          </div>,
          <div className={s.data}>
            <span className={s.key}>MessageType</span>
            <span> {dataObject.messageType}</span>
          </div>,
          <div className={s.data}>
            <span className={s.key}>RecipientType</span>
            <span> {dataObject.recipientType}</span>
          </div>,
          <div className={s.data}>
            <span className={s.key}>Recipients</span>
            <span>
              <div>{recipients}</div>
            </span>
          </div>,
          <div className={s.data}>
            <span className={s.key}>Subject</span>
            <span> {dataObject.subject}</span>
          </div>,
          <div className={s.data}>
            <span className={s.key}>Content</span>
            <span
              dangerouslySetInnerHTML={{
                __html:
                  dataObject.messageObject && dataObject.messageObject.content,
              }}
            />
          </div>,
        );
        break;
      }

      case 'user': {
        title = 'User';
        details.push(
          <div className={s.data}>
            <span className={s.key}>User</span>
            <UserThumbnail user={dataObject} />
          </div>,
        );
        switch (verb) {
          case 'update':
            details.push(
              <div className={s.data}>
                <span className={s.key}>Field</span>
                <span> {infoData.changedField}</span>
              </div>,
              <div className={s.data}>
                <span className={s.key}>Operation</span>
                <span>
                  {infoData.diff}
                  {infoData.added ? ' added' : ' removed'}
                </span>
              </div>,
            );

            break;

          default:
            break;
        }

        break;
      }

      case 'comment': {
        title = 'Comment';

        details.push(
          <div className={s.data}>
            <span className={s.key}>Content</span>
            <span> {dataObject.content}</span>
          </div>,
        );
        break;
      }

      case 'vote': {
        title = 'Vote';

        details.push(
          <div className={s.data}>
            <span className={s.key}>Position</span>
            <span> {dataObject.position}</span>
          </div>,
        );
        break;
      }
      case 'statement': {
        title = 'Statement';

        details.push(
          <div className={s.data}>
            <span className={s.key}>Content</span>
            <span>{dataObject.text} </span>
          </div>,
        );
        break;
      }
      case 'request': {
        title = 'Request';

        details.push(
          <div className={s.data}>
            <span className={s.key}>RequestType</span>
            <span>{dataObject.type} </span>
          </div>,
          <div className={s.data}>
            <span className={s.key}>Processed by</span>
            <UserThumbnail user={dataObject.processor} />
          </div>,
          <div className={s.data}>
            <span className={s.key}>Status</span>
            <span>{getRequestStatus(dataObject)}</span>
          </div>,
        );
        break;
      }
      case 'discussion': {
        title = 'Discussion';

        details.push(
          <div className={s.data}>
            <span className={s.key}>Title</span>
            <span> {dataObject.title}</span>
          </div>,
          <div className={s.data}>
            <span className={s.key}>Content</span>
            <span dangerouslySetInnerHTML={{ __html: dataObject.content }} />
          </div>,
        );
        break;
      }
      case 'proposal': {
        title = 'Proposal';
        details.push(
          <div className={s.data}>
            <span className={s.key}>Title</span>
            <span> {dataObject.title}</span>
          </div>,
          <div className={s.data}>
            <span className={s.key}>Content</span>
            <span dangerouslySetInnerHTML={{ __html: dataObject.body }} />
          </div>,
        );
        break;
      }

      default:
        break;
    }
    return (
      <div className={s.root}>
        <h2>{title}</h2>
        <div className={s.container}>{details}</div>
      </div>
    );
  }

  render() {
    const { onClose } = this.props;
    return (
      <Layer onClose={onClose}>
        <Box>{this.renderActivity()}</Box>
      </Layer>
    );
  }
}

export default withStyles(s)(ActivityLayer);
