import { FormattedRelative } from 'react-intl';
import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cn from 'classnames';
import s from './ProposalPreview.css';
import PollState from '../PollState';
import history from '../../history';
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
  };
  constructor(props) {
    super(props);
    this.state = { fullText: false };
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
    // TODO move to state
    const poll = getLastActivePoll(
      this.props.proposal.state,
      this.props.proposal,
    );

    /* eslint-disable jsx-a11y/interactive-supports-focus */

    const repelled = (
      <svg
        className={s.statusIcon}
        viewBox="0 0 24 24"
        role="img"
        version="1.1"
      >
        <defs>
          <mask id="mask-rep-2">
            <g>
              <rect x="0" y="0" width="24" height="24" fill="#fff" />
              <path d="M8,8 L16,16" strokeWidth="2" stroke="#000" fill="none" />
              <path d="M8,16 L16,8" strokeWidth="2" stroke="#000" fill="none" />
            </g>
          </mask>
        </defs>
        <g mask="url(#mask-rep-2)">
          <path d="M12,0 L24,12 L12,24 L0,12 Z" stroke="none" />
        </g>
      </svg>
    );
    const accepted = (
      <svg
        className={s.statusIcon}
        viewBox="0 0 24 24"
        role="img"
        aria-label="OK"
      >
        <defs>
          <mask id="mask-acc-2">
            <g>
              <rect x="0" y="0" width="24" height="24" fill="#fff" />
              <path
                d="M10,17.4 L5.3,12.7 L6.7,11.3 L10,14.6 L17.3,7.3 L18.7,8.7 L10,17.4 Z"
                stroke="none"
                fill="#000"
              />
            </g>
          </mask>
        </defs>
        <g mask="url(#mask-acc-2)">
          <circle cx="12" cy="12" r="12" stroke="none" />
        </g>
      </svg>
    );

    const active = (
      <svg className={s.statusIcon} viewBox="0 0 24 24" role="img">
        <defs>
          <mask id="mask-act-4">
            <g>
              <rect x="0" y="0" width="24" height="24" fill="#fff" />
              <g
                strokeWidth="2"
                stroke="#000"
                transform="translate(11.000000, 8.000000)"
              >
                <path role="presentation" d="M1,0 L1,6" fill="none" />
                <path role="presentation" d="M1,8 L1,10" fill="none" />
              </g>
            </g>
          </mask>
        </defs>
        <g mask="url(#mask-act-4)">
          <path
            role="presentation"
            d="M12,0 L0,22 L24,22 L12,0 L12,0 Z"
            stroke="none"
          />
        </g>
      </svg>
    );

    const survey = (
      <svg
        version="1.1"
        viewBox="0 0 24 24"
        width="24px"
        height="24px"
        role="img"
        aria-label="survey"
      >
        <path
          fill="none"
          stroke="#000"
          strokeWidth="2"
          d="M12,22 C17.5228475,22 22,17.5228475 22,12 C22,6.4771525 17.5228475,2 12,2 C6.4771525,2 2,6.4771525 2,12 C2,17.5228475 6.4771525,22 12,22 Z M12,15 L12,14 C12,13 12,12.5 13,12 C14,11.5 15,11 15,9.5 C15,8.5 14,7 12,7 C10,7 9,8.26413718 9,10 M12,16 L12,18"
        />
      </svg>
    );

    const pollPreview = [
      <svg viewBox="0 0 24 24" width="16px" height="16px" role="img">
        <path fill="none" stroke="#666" strokeWidth="2" d={ICONS.up} />
      </svg>,
      poll.upvotes,
      <div className={s.pollState}>
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
        <svg viewBox="0 0 24 24" width="16px" height="16px" role="img">
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

    let state;
    switch (this.props.proposal.state) {
      case 'voting':
      case 'proposed': {
        state = <div className={cn(s.status, s.active)}>{active}</div>;
        break;
      }
      case 'rejected':
      case 'revoked': {
        state = <div className={cn(s.status, s.repelled)}>{repelled}</div>;
        break;
      }
      case 'accepted': {
        state = <div className={cn(s.status, s.accepted)}>{accepted}</div>;
        break;
      }
      case 'survey': {
        state = <div className={cn(s.status)}>{survey}</div>;
        break;
      }
      default:
    }

    return (
      <div className={s.root}>
        <div className={s.container}>
          <div style={{ display: 'flex' }}>
            {/* <PollPreview poll={poll} /> */}
            {
              <div className={s.pollPreview}>
                {pollPreview} {state}
              </div>
            }

            <div style={{ paddingLeft: '1em' }}>
              <div className={s.date}>
                <FormattedRelative value={poll.endTime} />
              </div>
              <div
                role="link"
                style={{ cursor: 'pointer' }}
                onClick={this.handleClick}
                className={s.header}
              >
                {this.props.proposal.title}
              </div>
              {/* <div className={s.body}>
                {body}
              </div> */}
              {/* eslint-disable jsx-a11y/no-static-element-interactions */}
              <div className={s.tags}>
                {this.props.proposal.tags &&
                  this.props.proposal.tags.map(tag => (
                    <span
                      onClick={() =>
                        history.push(`/proposals/tagged/${tag.id}`)}
                      key={tag.id}
                      className={s.tag}
                    >{`${tag.text}`}</span>
                  ))}
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
