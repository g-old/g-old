import {
  FormattedRelative,
  FormattedMessage,
  defineMessages,
} from 'react-intl';
import React from 'react';
import PropTypes from 'prop-types';
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
    spokesman: PropTypes.shape({
      thumbnail: PropTypes.string,
      name: PropTypes.string,
      surname: PropTypes.string,
      id: PropTypes.string,
    }),
  };
  static defaultProps = {
    spokesman: null,
  };
  render() {
    return (
      <div className={s.root}>
        <div className={s.container}>
          <div className={s.state}>
            <ProposalState state={this.props.state} />
          </div>
          <div className={s.headline}>{this.props.title}</div>
          <div className={s.date}>
            <FormattedRelative value={this.props.publishedAt} />
          </div>
          <div
            className={s.body}
            dangerouslySetInnerHTML={{ __html: this.props.body }}
          />
          {this.props.spokesman && (
            <div>
              <UserThumbnail
                label={<FormattedMessage {...messages.spokesman} />}
                user={this.props.spokesman}
              />
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default withStyles(s)(Proposal);
