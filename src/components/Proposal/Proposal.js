import {
  FormattedRelative,
  FormattedMessage,
  defineMessages,
} from 'react-intl';
import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import withStyles from 'isomorphic-style-loader/withStyles';
import s from './Proposal.css';
import UserThumbnail from '../UserThumbnail';
import WorkteamHeader from '../WorkteamHeader';
import { ICONS } from '../../constants';

const messages = defineMessages({
  spokesman: {
    id: 'spokesman',
    defaultMessage: 'Spokesman',
    description: 'Spokesman label',
  },
});

class Proposal extends React.Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    state: PropTypes.string.isRequired,
    body: PropTypes.string.isRequired,
    publishedAt: PropTypes.string.isRequired,
    deletedAt: PropTypes.string,
    spokesman: PropTypes.shape({
      thumbnail: PropTypes.string,
      name: PropTypes.string,
      surname: PropTypes.string,
      id: PropTypes.string,
    }),
    workteam: PropTypes.shape({
      id: PropTypes.number,
      displayName: PropTypes.string,
      logo: PropTypes.string,
    }),
  };

  static defaultProps = {
    spokesman: null,
    deletedAt: null,
    workteam: null,
  };

  render() {
    const {
      deletedAt,
      title,
      publishedAt,
      body,
      spokesman,
      workteam,
    } = this.props;
    return (
      <div className={cn(s.root, deletedAt && s.deleted)}>
        <div className={s.container}>
          {workteam && (
            <WorkteamHeader
              displayName={workteam.displayName}
              id={workteam.id}
              logo={workteam.logo}
            />
          )}
          <div className={s.headline}>{title}</div>
          <div className={s.details}>
            {spokesman && (
              <div>
                <UserThumbnail
                  marked
                  label={<FormattedMessage {...messages.spokesman} />}
                  user={spokesman}
                />
              </div>
            )}
            <div className={s.date}>
              <svg
                version="1.1"
                viewBox="0 0 24 24"
                width="24px"
                height="24px"
                role="img"
              >
                <path
                  fill="none"
                  stroke="#666"
                  strokeWidth="2"
                  d={ICONS.edit}
                />
              </svg>{' '}
              <FormattedRelative value={parseInt(publishedAt, 10)} />
            </div>
          </div>
          <div className={s.body} dangerouslySetInnerHTML={{ __html: body }} />
        </div>
      </div>
    );
  }
}

export default withStyles(s)(Proposal);
