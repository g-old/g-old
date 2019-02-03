/* @flow */

import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { defineMessages, FormattedMessage } from 'react-intl';
import s from './VoteArea.css';
import { ICONS } from '../../constants';
import Button from '../Button';
import Box from '../Box';
import Value from '../Value';
import VoteBar from '../VoteBar';

type Fn = () => void;
type Props = {
  votersCount: number,
  threshold: number,
  active: boolean,
  upvotes: number,
  downvotes: number,
  unipolar: boolean,
  onUpvoteClick: Fn,
  onDownvoteClick: Fn,
  onClick: ?Fn,
  updates: UpdatesShape,
  ownVote: [VotesShape],
  children: React.Node,
};

const messages = defineMessages({
  request: {
    id: 'poll.votingRequest',
    defaultMessage:
      '{requestCount, plural, =0 {No voting request} one {# voting request} other {# voting requests}}',
    description: 'Voting requests',
  },
  upvote: {
    id: 'poll.upvote',
    defaultMessage:
      '{count, plural, =0 {No Upvotes} one {# Upvote} other {# Upvotes}}',
    description: 'Upvotes',
  },
  downvotes: {
    id: 'poll.downvote',
    defaultMessage:
      '{count, plural, =0 {No Downvote} one {# Downvote} other {# Downvotes}}',
    description: 'Upvotes',
  },
});
class VoteArea extends React.Component<Props> {
  render() {
    const {
      votersCount,
      threshold,
      updates,
      ownVote,
      active,
      upvotes,
      downvotes,
      unipolar,
      onUpvoteClick,
      onDownvoteClick,
      onClick,
      children,
    } = this.props;
    const userVotedUp =
      ownVote && ownVote.positions[0] && ownVote.positions[0].pos === 0;

    const userVotedDown =
      ownVote && ownVote.positions[0] && ownVote.positions[0].pos === 1;

    const sum = unipolar ? votersCount : upvotes + downvotes;
    const upPercent = sum > 0 ? 100 * (upvotes / sum) : 50;
    let component;
    const VoteViewComponent = (
      <VoteBar
        votersCount={votersCount}
        upvotes={upvotes}
        downvotes={downvotes}
        unipolar={unipolar}
        threshold={threshold}
        upColor={unipolar ? '#e0d500' : '#8cc800'}
        downColor={unipolar ? '#eee' : '#ff324d'}
        upstrokeWidth={userVotedUp ? 4 : 2}
        downstrokeWidth={userVotedDown ? 4 : 2}
        onUpClick={onClick}
        onDownClick={onClick}
      />
    );
    if (unipolar) {
      component = [
        <Box column align>
          <Button plain className={s.voteDetails} onClick={onClick}>
            <Value value={`${Math.round(upPercent)}%`} />
            <div>
              <FormattedMessage
                {...messages.request}
                values={{ requestCount: upvotes }}
              />
            </div>
          </Button>
          {active && (
            <Button plain disabled={updates.pending} onClick={onUpvoteClick}>
              <svg
                viewBox="0 0 24 24"
                width="30px"
                height="30px"
                role="img"
                aria-label="halt"
              >
                <path
                  fill="none"
                  stroke={userVotedUp ? '#e0b000' : '#666'}
                  strokeWidth="1"
                  d={ICONS.halt}
                />
              </svg>
            </Button>
          )}
        </Box>,
        VoteViewComponent,
      ];
    } else {
      component = [
        <Box column align>
          <Button plain className={s.voteDetails} onClick={onClick}>
            <Value value={`${Math.round(upPercent)}%`} />
            <div>
              <FormattedMessage
                {...messages.upvote}
                values={{ count: upvotes }}
              />
            </div>
          </Button>
          {active && (
            <Button plain disabled={updates.pending} onClick={onUpvoteClick}>
              <svg
                viewBox="0 0 24 24"
                width="30px"
                height="30px"
                role="img"
                aria-label="halt"
              >
                {/* <defs>
                  <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop
                      offset="0%"
                      style={{ stopColor: 'rgb(255, 255, 0)', stopOpacity: 1 }}
                    />
                    <stop
                      offset="100%"
                      style={{ stopColor: 'rgb(255, 0, 0)', stopOpacity: 1 }}
                    />
                  </linearGradient>
                </defs> */}
                <path
                  fill="none"
                  stroke={
                    userVotedUp ? '#8cc800' : '#666' // stroke={userVotedUp ? 'url(#grad1)' : '#666'}
                  }
                  strokeWidth="1"
                  d={ICONS.thumbUpAlt}
                />
              </svg>
            </Button>
          )}
        </Box>,
        VoteViewComponent,
        <Box column align>
          <Button plain className={s.voteDetails} onClick={onClick}>
            <Value value={`${100 - Math.round(upPercent)}%`} />
            <div>
              <FormattedMessage
                {...messages.downvotes}
                values={{ count: downvotes }}
              />
            </div>
          </Button>
          {active && (
            <Button plain disabled={updates.pending} onClick={onDownvoteClick}>
              <svg
                viewBox="0 0 24 24"
                width="30px"
                height="30px"
                role="img"
                aria-label="halt"
              >
                <path
                  fill="none"
                  stroke={userVotedDown ? '#ff324d' : '#666'}
                  strokeWidth="1"
                  d={ICONS.thumbUpAlt}
                  transform="rotate(180 12 12)"
                />
              </svg>
            </Button>
          )}
        </Box>,
      ];
    }
    return (
      <Box column align justify className={s.voteBox}>
        <Box align justify>
          {component}
        </Box>
        {children}
      </Box>
    );
  }
}

export default withStyles(s)(VoteArea);
