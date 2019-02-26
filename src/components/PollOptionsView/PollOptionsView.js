/* @flow */

import React from 'react';
import withStyles from 'isomorphic-style-loader/withStyles';
import s from './PollOptionsView.css';
import Box from '../Box';
import PollOption from '../PollOption';
import OptionsMenu from './OptionsMenu';
import type { OptionShape } from '../ProposalInput';

type Props = {
  options: OptionShape[],
  updates: UpdatesShape,
  pollOptions: {
    [number]: { ...OptionShape, checked: boolean, disabled: boolean },
  },
  onChange: () => void,
  numVotes: number,
  followeeVotes: VoteShape[],
  votes: VoteShape[],
  onLoadVotes: () => void,
};

type State = {
  isSorted: boolean,
  isCollapsed: boolean,
  showAbsoluteValues: boolean,
};

class PollOptionsView extends React.Component<Props, State> {
  static defaultProps = {};

  constructor(props: Props) {
    super(props);
    this.state = {
      isSorted: props.closedAt,
      isCollapsed: false,
      showAbsoluteValues: false,
    };
    this.handleSorting = this.handleSorting.bind(this);
    this.handleCollapsing = this.handleCollapsing.bind(this);
    this.handleVisualization = this.handleVisualization.bind(this);
  }

  handleSorting: () => void;

  handleCollapsing: () => void;

  handleVisualization: () => void;

  handleSorting() {
    this.setState(({ isSorted }) => ({ isSorted: !isSorted }));
  }

  handleCollapsing() {
    this.setState(({ isCollapsed }) => ({
      isCollapsed: !isCollapsed,
    }));
  }

  handleVisualization() {
    this.setState(({ showAbsoluteValues }) => ({
      showAbsoluteValues: !showAbsoluteValues,
    }));
  }

  render() {
    const {
      options,
      updates,
      pollOptions,
      onChange,
      numVotes,
      followeeVotes = [],
      votes,
      onLoadVotes,
      canVote,
      closedAt,
    } = this.props;
    const { isSorted, isCollapsed, showAbsoluteValues } = this.state;
    const ops = isSorted
      ? [...options].sort((a, b) => b.numVotes - a.numVotes)
      : options;
    const allVotes = showAbsoluteValues
      ? options && options.reduce((res, option) => res + option.numVotes, 0)
      : numVotes;
    return (
      <Box column fill>
        {!closedAt && (
          <OptionsMenu
            isSorted={isSorted}
            onSort={this.handleSorting}
            onCollapse={this.handleCollapsing}
            isCollapsed={isCollapsed}
            onChangeOrder={this.handleVisualization}
          />
        )}
        {ops &&
          ops.map(o => (
            <PollOption
              {...o}
              allVotes={allVotes}
              inactive={closedAt}
              showVotes
              updates={updates}
              checked={pollOptions[o.pos].checked}
              disabled={updates.pending || !canVote}
              onChange={onChange}
              followeeVotes={followeeVotes.filter(vote =>
                vote.positions.find(position => position.pos === o.pos),
              )}
              onLoadVotes={onLoadVotes}
              votes={
                votes &&
                votes.filter(vote =>
                  vote.positions.find(position => position.pos === o.pos),
                )
              }
              isCollapsed={isCollapsed}
            />
          ))}
      </Box>
    );
  }
}

export default withStyles(s)(PollOptionsView);
