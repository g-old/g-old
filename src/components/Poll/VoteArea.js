/* @flow */

import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './VoteArea.css';
import { ICONS } from '../../constants';
import Button from '../Button';
import Box from '../Box';
import Value from '../Value';
import VoteBar from '../VoteBar';

type Fn = () => void;
type Props = {
  allVoters: number,
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
};
class VoteArea extends React.Component<Props> {
  render() {
    const {
      allVoters,
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
    } = this.props;
    const userVotedUp =
      ownVote && ownVote.positions[0] && ownVote.positions[0].pos === 0;

    const userVotedDown =
      ownVote && ownVote.positions[0] && ownVote.positions[0].pos === 1;

    const sum = unipolar ? allVoters : upvotes + downvotes;
    const upPercent = sum > 0 ? 100 * (upvotes / sum) : 50;
    let component;
    const VoteViewComponent = (
      <VoteBar
        votersCount={allVoters}
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
            <div>{upvotes} Voting request</div>
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
            <div>{upvotes} Upvotes</div>
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
                  stroke={userVotedUp ? '#8cc800' : '#666'}
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
            <div>{downvotes} Downvotes</div>
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
      <Box align justify className={s.voteBox}>
        {component}
      </Box>
    );
  }
}

export default withStyles(s)(VoteArea);
