import { FormattedRelative } from 'react-intl';
import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/withStyles';
import cn from 'classnames';
import s from './ProposalPreview.css';
import PollState from '../PollState';
import history from '../../history';
import ProposalState from '../ProposalState';
import { ICONS } from '../../constants';
import Meter from '../Meter';
import Image from '../Image';

import { getLastActivePoll } from '../../core/helpers';
// import { DOMParser } from 'xmldom';

class ProposalPreview extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    const { onClick, proposal } = this.props;
    if (onClick) {
      const { id, state } = proposal;
      const poll = getLastActivePoll(state, proposal);
      onClick({ proposalId: id, pollId: poll.id });
    }
  }

  render() {
    const { proposal } = this.props;
    if (!proposal) {
      return <div />;
    }
    // TODO move to state
    const poll = getLastActivePoll(proposal.state, proposal);

    if (!poll) {
      return <div />;
    }
    let upvotes = 0;
    let downvotes = 0;
    if (poll.mode.thresholdRef === 'all') {
      upvotes = poll.options[0].numVotes;
    } else {
      upvotes = poll.options[0].numVotes;
      downvotes = poll.options[1].numVotes;
    }
    // 3 small meters , allvotes
    let pollPreview;
    if (poll.extended) {
      pollPreview = [
        <div className={s.pollOptions}>
          <Meter
            trailWidth={1}
            trailColor="#eee"
            strokeColor="#8cc800"
            strokeWidth={6}
            percent={90}
          />
          <Meter
            trailWidth={1}
            trailColor="#eee"
            strokeColor="#8cc800"
            strokeWidth={6}
            percent={60}
          />
          <Meter
            trailWidth={1}
            trailColor="#eee"
            strokeColor="#8cc800"
            strokeWidth={6}
            percent={30}
          />
        </div>,
        poll.numVotes,
      ];
    } else {
      pollPreview = [
        <svg key="0" viewBox="0 0 24 24" width="16px" height="16px" role="img">
          <path fill="none" stroke="#666" strokeWidth="2" d={ICONS.up} />
        </svg>,
        upvotes,
        <div key="2" className={s.pollState}>
          <PollState
            compact
            upvotes={upvotes}
            downvotes={downvotes}
            pollId={poll.id}
            allVoters={poll.allVoters}
            options={poll.options}
            thresholdRef={poll.mode.thresholdRef}
            threshold={poll.threshold}
            unipolar={poll.mode.unipolar}
          />
        </div>,
      ];

      if (!poll.mode.unipolar) {
        pollPreview.push(downvotes);
        pollPreview.push(
          <svg
            key="4"
            viewBox="0 0 24 24"
            width="16px"
            height="16px"
            role="img"
          >
            <path
              fill="none"
              stroke="#666"
              strokeWidth="2"
              d={ICONS.up}
              transform="matrix(1 0 0 -1 0 24)"
            />
            ,
          </svg>,
        );
      }
    }

    return (
      <div
        onClick={this.handleClick}
        className={cn(s.root, proposal.image && s.center)}
      >
        {proposal.image && (
          <Image
            size="medium"
            src={proposal.image}
            style={{ borderRadius: '6px' }}
          />
        )}

        <div className={s.container}>
          <div // eslint-disable-line
            style={{ display: 'flex' }}
          >
            {/* <PollPreview poll={poll} /> */}
            {
              <div className={s.pollPreview}>
                {pollPreview} <ProposalState state={proposal.state} />
              </div>
            }

            <div style={{ paddingLeft: '1em' }}>
              <div className={s.date}>
                <FormattedRelative value={poll.endTime} />
              </div>
              <div className={s.header}>{proposal.title}</div>
              <div>{proposal.summary}</div>
              {/* <div
                style={{
                  backgroundImage: `url(${proposal.image})`,
                  width: 'auto',
                  height: '4em',
                }}
              /> */}
              {/* <div className={s.body}>
                {body}
              </div> */}
              {/* eslint-disable jsx-a11y/no-static-element-interactions */}
              <div className={s.tags}>
                {proposal.tags &&
                  proposal.tags.map(
                    tag =>
                      tag && (
                        <span // eslint-disable-line
                          onClick={e => {
                            e.stopPropagation();
                            history.push(`/proposals/tagged/${tag.id}`);
                          }}
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

ProposalPreview.propTypes = {
  proposal: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    state: PropTypes.string.isRequired,
    body: PropTypes.string.isRequired,
    publishedAt: PropTypes.string,
    pollOne: PropTypes.object,
    pollTwo: PropTypes.object,
    tags: PropTypes.arrayOf(PropTypes.object),
    summary: PropTypes.string.isRequired,
    image: PropTypes.string,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
};

export default withStyles(s)(ProposalPreview);
