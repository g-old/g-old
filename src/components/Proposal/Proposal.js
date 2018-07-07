import {
  FormattedRelative,
  FormattedMessage,
  defineMessages,
} from 'react-intl';
import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import ProposalState from '../ProposalState';
import s from './Proposal.css';
import UserThumbnail from '../UserThumbnail';

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
  };

  static defaultProps = {
    spokesman: null,
    deletedAt: null,
  };

  render() {
    const {
      deletedAt,
      state,
      title,
      publishedAt,
      body,
      spokesman,
    } = this.props;
    return (
      <div className={cn(s.root, deletedAt && s.deleted)}>
        <div className={s.container}>
          <div className={s.state}>
            <ProposalState state={state} />
          </div>
          <div className={s.headline}>{title}</div>
          <div className={s.date}>
            <FormattedRelative value={publishedAt} />
          </div>
          <div className={s.body} dangerouslySetInnerHTML={{ __html: body }} />
          {spokesman && (
            <div>
              <UserThumbnail
                marked
                label={<FormattedMessage {...messages.spokesman} />}
                user={spokesman}
              />
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default withStyles(s)(Proposal);
