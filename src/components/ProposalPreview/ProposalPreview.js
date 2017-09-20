import { FormattedRelative } from 'react-intl';
import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
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
  };
  constructor(props) {
    super(props);
    this.state = { fullText: false };
  }

  render() {
    const poll = getLastActivePoll(
      this.props.proposal.state,
      this.props.proposal,
    );

    /* eslint-disable jsx-a11y/interactive-supports-focus */

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

    return (
      <div className={s.root}>
        <div className={s.container}>
          <div style={{ display: 'flex' }}>
            {/* <PollPreview poll={poll} />*/}
            {
              <div className={s.pollPreview}>
                {pollPreview}
              </div>
            }
            <div style={{ paddingLeft: '1em' }}>
              <div className={s.date}>
                <FormattedRelative value={poll.endTime} />
              </div>
              <div
                role="link"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  history.push(
                    `/proposal/${this.props.proposal.id}/${poll.id}`,
                  );
                }}
                className={s.header}
              >
                {this.props.proposal.title}
              </div>
              {/* <div className={s.body}>
                {body}
              </div>*/}
              {/* eslint-disable jsx-a11y/no-static-element-interactions */}
              <div className={s.tags}>
                {this.props.proposal.tags &&
                  this.props.proposal.tags.map(tag =>
                    <span
                      onClick={() =>
                        history.push(`/proposals/tagged/${tag.id}`)}
                      key={tag.id}
                      className={s.tag}
                    >{`${tag.text}`}</span>,
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
