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
import Button from '../Button';
import history from '../../history';
import { ApprovalStates } from '../../organization';

const APPROVED =
  // eslint-disable-next-line no-bitwise
  ApprovalStates.CONTENT_APPROVED | ApprovalStates.TOPIC_APPROVED;
const messages = defineMessages({
  spokesman: {
    id: 'spokesman',
    defaultMessage: 'Spokesman',
    description: 'Spokesman label',
  },
  create: {
    id: 'command.createWt',
    defaultMessage: 'Create workteam',
    description: 'command to create a workteam',
  },
  workteam: {
    id: 'label.workteam',
    defaultMessage: 'Workteam',
    description: 'label workteam',
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
      id,
      state,
      teamId,
      user,
      approvalState,
    } = this.props;

    // eslint-disable-next-line no-bitwise
    const isApproved = (approvalState & APPROVED) > 0;
    return (
      <Box column fill className={cn(s.root, deletedAt && s.deleted)}>
        {image && (
          <Image
            fit
            src={image}
            style={{
              borderRadius: '6px',
              borderBottomLeftRadius: '0px',
              borderBottomRightRadius: '0px',
            }}
          />
        )}
        {teamId && (
          <Button
            onClick={() => history.push(`/workteams/${teamId}`)}
            icon={
              <svg version="1.1" viewBox="0 0 24 24" role="img">
                <path
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2"
                  d={ICONS.leftArrow}
                />
              </svg>
            }
            className={cn(s.actionBtn, !image && s.lower)}
            primary
          >
            <FormattedMessage {...messages.workteam} />
          </Button>
        )}
        <Box fill column className={s.container}>
          {workteam && (
            <WorkteamHeader
              displayName={workteam.displayName}
              id={workteam.id}
              logo={workteam.logo}
            />
          )}
          <div className={cn(s.headline, !teamId && s.resetMargin)}>
            {title}{' '}
            {isApproved && (
              <svg width="24px" height="24px" viewBox="0 0 24 24">
                <path d="M23,12L20.56,9.22L20.9,5.54L17.29,4.72L15.4,1.54L12,3L8.6,1.54L6.71,4.72L3.1,5.53L3.44,9.21L1,12L3.44,14.78L3.1,18.47L6.71,19.29L8.6,22.47L12,21L15.4,22.46L17.29,19.28L20.9,18.46L20.56,14.78L23,12M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z" />
              </svg>
            )}
          </div>

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
            {state === 'accepted' &&
              !teamId &&
              spokesman &&
              spokesman.id === user.id && (
                <Button
                  icon={
                    <svg aria-label="Group" viewBox="0 0 24 24">
                      <path
                        fill="none"
                        stroke="#8cc800"
                        strokeWidth="2"
                        d="M12,13 C14.209139,13 16,11.209139 16,9 C16,6.790861 14.209139,5 12,5 C9.790861,5 8,6.790861 8,9 C8,11.209139 9.790861,13 12,13 Z M6,22 L6,19 C6,15.6862915 8.6862915,13 12,13 C15.3137085,13 18,15.6862915 18,19 L18,22 M13,5 C13.4037285,3.33566165 15.0151447,2 17,2 C19.172216,2 20.98052,3.790861 21,6 C20.98052,8.209139 19.172216,10 17,10 L16,10 L17,10 C20.287544,10 23,12.6862915 23,16 L23,18 M11,5 C10.5962715,3.33566165 8.98485529,2 7,2 C4.82778404,2 3.01948003,3.790861 3,6 C3.01948003,8.209139 4.82778404,10 7,10 L8,10 L7,10 C3.71245602,10 1,12.6862915 1,16 L1,18"
                      />
                    </svg>
                  }
                  primary
                  onClick={() => history.push(`/workteams/create/${id}`)}
                >
                  <FormattedMessage {...messages.create} />
                </Button>
              )}
          </div>
          <div className={s.body} dangerouslySetInnerHTML={{ __html: body }} />
        </Box>
      </Box>
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
  id: PropTypes.string.isRequired,
  user: PropTypes.shape({ id: PropTypes.string }).isRequired,
  teamId: PropTypes.string,
  workteam: PropTypes.shape({
    id: PropTypes.number,
    displayName: PropTypes.string,
    logo: PropTypes.string,
  }),
  approvalState: PropTypes.number.isRequired,
};

Proposal.defaultProps = {
  spokesman: null,
  deletedAt: null,
  workteam: null,
  image: null,
  teamId: null,
};

export default withStyles(s)(Proposal);
