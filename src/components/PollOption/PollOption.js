/* @flow */
import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './PollOption.css';
import Box from '../Box';
import CheckBox from '../CheckBox';
import Meter from '../Meter';
import Value from '../Value';
import Card from '../Card';
import UserThumbnail from '../UserThumbnail';
import VotesList from '../VotesList';
import Label from '../Label';

type PollOptionProps = {
  description: string,
  title: string,
  onChange: ({ pos: number }) => void,
  checked: boolean,
  disabled: boolean,
  numVotes: number,
  pos: number,
  showVotes: boolean,
  allVotes: number,
  isCollapsed: boolean,
  onLoadVotes: () => void,
  followeeVotes: VoteShape[],
  votes: VoteShape[],
  updates: UpdatesShape,
  inactive: boolean,
};

type State = {
  votesExpanded?: boolean,
};

class PollOption extends React.Component<PollOptionProps, State> {
  constructor(props) {
    super(props);
    this.state = {};
    this.handleChange = this.handleChange.bind(this);
    this.handleLoadVotes = this.handleLoadVotes.bind(this);
  }

  handleChange: () => void;

  handleLoadVotes: () => void;

  handleChange() {
    const { pos, onChange } = this.props;
    if (onChange) {
      onChange({ pos });
    }
  }

  handleLoadVotes() {
    const { onLoadVotes } = this.props;
    if (onLoadVotes) {
      this.setState(
        ({ votesExpanded }) => ({ votesExpanded: !votesExpanded }),
        () => this.state.votesExpanded && onLoadVotes(), // eslint-disable-line
      );
    }
  }

  render() {
    const {
      description,
      checked,
      disabled,
      numVotes,
      showVotes,
      allVotes,
      isCollapsed,
      followeeVotes = [],
      votes,
      onLoadVotes,
      updates,
      title,
      inactive,
    } = this.props;

    const { votesExpanded } = this.state;
    let titleLine = title;
    if (isCollapsed && titleLine.length > 27) {
      titleLine = `${titleLine.slice(0, 30)} ...`;
    }

    return (
      <Card className={s.root}>
        <Box column>
          <Box between align>
            <Box align>
              {!inactive && (
                <CheckBox
                  checked={checked}
                  disabled={disabled}
                  onChange={this.handleChange}
                />
              )}
              <div>
                <Label>{titleLine}</Label>
                {!isCollapsed && (
                  <div dangerouslySetInnerHTML={{ __html: description }} />
                )}
              </div>
            </Box>
            <Value value={numVotes} />
          </Box>
          {showVotes && (
            <Box column onClick={this.handleLoadVotes}>
              <Meter
                className={s.meter}
                trailWidth={3}
                trailColor="#eee"
                strokeColor={checked ? '#8cc800' : '#e0d500'}
                strokeWidth={5}
                percent={allVotes ? (numVotes * 100) / allVotes : 0}
              />
              {votesExpanded && (
                <VotesList
                  unipolar
                  votes={votes}
                  getVotes={onLoadVotes}
                  autoLoadVotes
                  isFetching={updates.pending}
                  errorMessage={updates.error}
                />
              )}
            </Box>
          )}
          {followeeVotes.map(v => (
            <UserThumbnail user={v.voter} />
          ))}
        </Box>
      </Card>
    );
  }
}

export default withStyles(s)(PollOption);
