import { FormattedRelative } from 'react-intl';
import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cn from 'classnames';
import s from './ProposalPreview.css';
import PollState from '../PollState';
import history from '../../history';
import ProposalState from '../ProposalState';
import { ICONS } from '../../constants';

import { getLastActivePoll } from '../../core/helpers';
// import { DOMParser } from 'xmldom';

class ProposalPreview extends React.Component {
  static propTypes = {
    proposal: PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      state: PropTypes.string.isRequired,
      body: PropTypes.string.isRequired,
      publishedAt: PropTypes.string,
      pollOne: PropTypes.object,
      pollTwo: PropTypes.object,
      tags: PropTypes.arrayOf(PropTypes.object),
    }).isRequired,
    onClick: PropTypes.func.isRequired,
    className: PropTypes.string,
  };
  static defaultProps = {
    className: null,
  };
  constructor(props) {
    super(props);
    this.state = {};
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    if (this.props.onClick) {
      const { id, state } = this.props.proposal;
      const poll = getLastActivePoll(state, this.props.proposal);
      this.props.onClick({ proposalId: id, pollId: poll.id });
    }
  }

  render() {
    if (!this.props.proposal) {
      return <div />;
    }
    // TODO move to state
    const poll = getLastActivePoll(
      this.props.proposal.state,
      this.props.proposal,
    );

    const pollPreview = [
      <svg key="0" viewBox="0 0 24 24" width="16px" height="16px" role="img">
        <path fill="none" stroke="#666" strokeWidth="2" d={ICONS.up} />
      </svg>,
      poll.upvotes,
      <div key="2" className={s.pollState}>
        <PollState
          compact
          pollId={poll.id}
          allVoters={poll.allVoters}
          upvotes={poll.upvotes}
          downvotes={poll.downvotes}
          thresholdRef={poll.mode.thresholdRef}
          threshold={poll.threshold}
          unipolar={poll.mode.unipolar}
        />
      </div>,
    ];

    if (!poll.mode.unipolar) {
      pollPreview.push(poll.downvotes);
      pollPreview.push(
        <svg key="4" viewBox="0 0 24 24" width="16px" height="16px" role="img">
          <path
            fill="none"
            stroke="#666"
            strokeWidth="2"
            d={ICONS.up}
            transform="matrix(1 0 0 -1 0 24)"
          />,
        </svg>,
      );
    }

    return (
      <div className={cn(s.root, this.props.className)}>
        <div className={s.container}>
          <div // eslint-disable-line
            style={{ display: 'flex', cursor: 'pointer' }}
            role="link"
            onClick={this.handleClick}
          >
            {/* <PollPreview poll={poll} /> */}
            {
              <div className={s.pollPreview}>
                {pollPreview}{' '}
                <ProposalState state={this.props.proposal.state} />
              </div>
            }

            <div style={{ paddingLeft: '1em' }}>
              <div className={s.date}>
                <FormattedRelative value={poll.endTime} />
              </div>
              <div className={s.header}>{this.props.proposal.title}</div>
              {/* <div className={s.body}>
                {body}
              </div> */}
              {/* eslint-disable jsx-a11y/no-static-element-interactions */}
              <div className={s.tags}>
                {this.props.proposal.tags &&
                  this.props.proposal.tags.map(
                    tag =>
                      tag && (
                        <span // eslint-disable-line
                          onClick={() =>
                            history.push(`/proposals/tagged/${tag.id}`)
                          }
                          key={tag.id}
                          className={s.tag}
                        >{`${tag.displayName}`}</span>
                      ),
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
    /* eslint-enable jsx-a11y/no-static-element-interactions */
  }
}

export default withStyles(s)(ProposalPreview);
