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
import Image from '../Image';
import Box from '../Box';

const messages = defineMessages({
  spokesman: {
    id: 'spokesman',
    defaultMessage: 'Spokesman',
    description: 'Spokesman label',
  },
});

class Proposal extends React.Component {
  render() {
    const {
      deletedAt,
      title,
      publishedAt,
      body,
      spokesman,
      workteam,
      image,
    } = this.props;
    return (
      <div className={cn(s.root, deletedAt && s.deleted)}>
        <Box column pad className={s.container}>
          {workteam && (
            <WorkteamHeader
              displayName={workteam.displayName}
              id={workteam.id}
              logo={workteam.logo}
            />
          )}
          <div className={s.headline}>{title}</div>
          {image && <Image fit src={image} style={{ borderRadius: '6px' }} />}

          <div className={s.details}>
            {spokesman && (
              <div>
                <UserThumbnail
                  marked
                  // eslint-disable-next-line react/jsx-props-no-spreading
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
              <FormattedRelative value={publishedAt} />
            </div>
          </div>
          <div className={s.body} dangerouslySetInnerHTML={{ __html: body }} />
        </Box>
      </div>
    );
  }
}

Proposal.propTypes = {
  title: PropTypes.string.isRequired,
  state: PropTypes.string.isRequired,
  body: PropTypes.string.isRequired,
  publishedAt: PropTypes.string.isRequired,
  deletedAt: PropTypes.string,
  image: PropTypes.string,
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

Proposal.defaultProps = {
  spokesman: null,
  deletedAt: null,
  workteam: null,
  image: null,
};

export default withStyles(s)(Proposal);
