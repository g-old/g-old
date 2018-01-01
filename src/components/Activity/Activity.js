import React from 'react';
import PropTypes from 'prop-types';
import { FormattedRelative } from 'react-intl';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Activity.css';
import Avatar from '../Avatar';
import Statement from '../Statement';
import ProposalPreview from '../ProposalPreview';
import Link from '../Link';
import history from '../../history';
import { ICONS } from '../../constants';

class Activity extends React.Component {
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
      position: PropTypes.string,
    }),
    info: PropTypes.string.isRequired,
    verb: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
  };
  static defaultProps = {
    content: {},
  };

  constructor(props) {
    super(props);
    this.renderVote = this.renderVote.bind(this);
  }

  // eslint-disable-next-line class-methods-use-this
  onProposalClick({ proposalId, pollId }) {
    history.push(`/proposal/${proposalId}/${pollId}`);
  }

  renderVote(info) {
    const { position } = this.props.content;
    const thumb = (
      <svg
        viewBox="0 0 24 24"
        width="60px"
        height="24px"
        role="img"
        aria-label="halt"
      >
        <path
          fill="none"
          stroke={this.props.content.position === 'pro' ? '#8cc800' : '#ff324d'}
          strokeWidth="1"
          d={ICONS.thumbUpAlt}
          transform={position === 'pro' ? '' : 'scale(1,-1) translate(0,-24)'}
        />
      </svg>
    );
    return (
      <Link
        to={`/proposal/${info.proposalId || 'xxx'}/${this.props.content
          .pollId}`}
      >
        <div className={s.follower}>
          <span>
            <Avatar user={this.props.content.voter} isFollowee />
            <span>
              {`${this.props.content.voter.name} ${this.props.content.voter
                .surname}`}
            </span>
          </span>

          {thumb}
        </div>
      </Link>
    );
  }
  render() {
    let content = null;
    let header = null;
    /* eslint-disable no-underscore-dangle */
    if (this.props.content && this.props.content.__typename === 'StatementDL') {
      const info = JSON.parse(this.props.info || '{}');
      content = (
        <Link
          to={`/proposal/${info.proposalId || 'xxx'}/${this.props.content
            .pollId}`}
        >
          <Statement {...this.props.content} />
        </Link>
      );
      header = info.proposalTitle || ':(';
    } else if (
      this.props.content &&
      this.props.content.__typename === 'ProposalDL'
    ) {
      content = (
        <ProposalPreview
          proposal={this.props.content}
          onClick={this.onProposalClick}
        />
      );
      if (this.props.verb === 'create') {
        if (this.props.content.state === 'survey') {
          header = 'New Survey';
        } else {
          header = 'NEW Proposal!';
        }
      } else if (this.props.verb === 'close') {
        header = 'Soon closing!';
      } else if (this.props.verb === 'accept') {
        header = 'This voting has been accepted!';
      } else if (this.props.verb === 'reject') {
        header = 'This proposal is now valid!';
      } else if (this.props.verb === 'update') {
        if (this.props.content.state === 'voting') {
          header = 'Voting open!';
        } else if (this.props.content.state === 'revoked') {
          header = 'Proposal has been revoked';
        } else if (this.props.content.state === 'accepted') {
          header = 'This proposal has been accepted!';
        } else if (this.props.content.state === 'rejected') {
          header = 'This proposal has been rejected!';
        }
      }
    } else if (
      this.props.content &&
      this.props.content.__typename === 'VoteDL'
    ) {
      const info = JSON.parse(this.props.info || '{}');

      content = this.renderVote(info);

      header = info.proposalTitle || ':(';
    } else {
      content = JSON.stringify(this.props.content);
      header = 'Nobody knows ...';
    }
    /* eslint-enable no-underscore-dangle */

    return (
      <div className={s.container}>
        <div className={s.date}>
          <FormattedRelative value={this.props.date} />
        </div>
        <div className={s.header}>{header}</div>

        <div>{content}</div>
      </div>
    );
  }
}

export default withStyles(s)(Activity);
