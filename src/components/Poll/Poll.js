import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedRelative,
  defineMessages,
  FormattedMessage,
} from 'react-intl';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cn from 'classnames';
import s from './Poll.css';
import Button from '../Button';
import Box from '../Box';
import Layer from '../Layer';
import VoteArea from './VoteArea';
import Notification from '../Notification';
import history from '../../history';
import PollOptionsView from '../PollOptionsView';
import Avatar from '../Avatar';
import VotesList from '../VotesList';

const messages = defineMessages({
  closed: {
    id: 'poll.closed',
    defaultMessage: 'Ended',
    description: 'Poll closing time',
  },
  closing: {
    id: 'poll.closing',
    defaultMessage: 'Closing',
    description: 'Poll ending time',
  },
  retract: {
    id: 'poll.retractVote',
    defaultMessage: 'Retract your vote',
    description: 'Drawing back the vote',
  },
  cancel: {
    id: 'commands.cancel',
    defaultMessage: 'Cancel',
    description: 'Short command to cancel a operation',
  },

  notify: {
    id: 'poll.notify',
    defaultMessage: 'Your statement will be deleted!',
    description: 'Notice that vote change will lead to statement deletion',
  },
  error: {
    id: 'poll.voteError',
    defaultMessage: 'Voting failed!',
    description: 'Notice that voting was not successful',
  },
});

const mapOptions = (options, ownVote) => {
  let positions = [];
  if (ownVote && ownVote.positions) {
    ({ positions } = ownVote);
  }
  return options.reduce((obj, option) => {
    // eslint-disable-next-line
    obj[option.pos] = {
      ...option,
      checked: positions.some(p => p.pos === option.pos && p.value),
      disabled: false,
    };
    return obj;
  }, {});
};

class Poll extends React.Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    threshold: PropTypes.number.isRequired,
    endTime: PropTypes.string.isRequired,
    allVoters: PropTypes.number.isRequired,
    ownStatement: PropTypes.shape({}),
    closedAt: PropTypes.string,
    // statements: PropTypes.arrayOf(PropTypes.object),
    upvotes: PropTypes.number.isRequired,
    downvotes: PropTypes.number.isRequired,
    votes: PropTypes.arrayOf(PropTypes.shape({})),
    ownVote: PropTypes.shape({
      id: PropTypes.string,
      positions: PropTypes.string,
      pollId: PropTypes.string,
    }),
    mode: PropTypes.shape({
      withStatements: PropTypes.bool,
      unipolar: PropTypes.bool,
      thresholdRef: PropTypes.string,
    }).isRequired,
    onVote: PropTypes.func.isRequired,
    onFetchVoters: PropTypes.func.isRequired,
    followeeVotes: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    filter: PropTypes.string.isRequired,
    updates: PropTypes.shape({ vote: PropTypes.shape({}) }).isRequired,
    canVote: PropTypes.bool,
  };

  static defaultProps = {
    votes: null,
    ownVote: null,
    ownStatement: null,
    closedAt: null,
    canVote: null,
  };

  constructor(props) {
    super(props);
    this.state = { pollOptions: mapOptions(props.options, props.ownVote) };
    this.voteUp = this.voteUp.bind(this);
    this.voteDown = this.voteDown.bind(this);
    this.fetchVoters = this.fetchVoters.bind(this);
    this.handleOptionSelection = this.handleOptionSelection.bind(this);
    this.toggleVotersBox = this.toggleVotersBox.bind(this);
  }

  componentWillReceiveProps({ updates, id, options, ownVote }) {
    const { id: oldId, updates: oldUpdates } = this.props;
    if (id === oldId && updates) {
      let voteError;
      if (updates.error) {
        const oldStatus = oldUpdates || {};
        voteError = !oldStatus.error;
      }
      if (updates.success) {
        voteError = false;
      }
      this.setState({
        voteError,
        pollOptions: mapOptions(options, ownVote),
      });
    }
  }

  getFolloweeVotes(pos) {
    const { followeeVotes } = this.props;
    if (!followeeVotes) {
      return null;
    }
    return followeeVotes
      .filter(vote => vote.positions[0].pos === (pos === 'pro' ? 0 : 1))
      .map(vote => (
        <Avatar
          onClick={() => {
            history.push(`/accounts/${vote.voter.id}`);
          }}
          className={s.followee}
          user={vote.voter}
        />
      ));
  }

  toggleVotersBox() {
    const { isExpanded } = this.state;
    this.setState(prevState => ({ isExpanded: !prevState.isExpanded }));
    if (!isExpanded) {
      this.fetchVoters();
    }
  }

  canVote(positions) {
    const { ownVote, ownStatement, id, onVote, extended } = this.props;
    let method; // or take methods better directly in and connect to redux
    let info = null;

    if (!ownVote) {
      method = 'create';
    } else if (ownVote.positions[0].pos !== positions[0].pos || extended) {
      if (
        // delete last selected option
        extended &&
        ownVote.positions.length === 1 &&
        ownVote.positions[0].pos === positions[0].pos &&
        positions[0].value === 0
      ) {
        method = 'del';
      } else {
        method = 'update';
      }
    } else {
      method = 'del';
    }
    const voteId = ownVote ? ownVote.id : null;
    if (ownStatement) {
      info = ownStatement.id;
      this.setState({
        confirmationFunc: () => {
          onVote({ vote: { positions, pollId: id, id: voteId } }, method, info);
          this.setState({ confirmationFunc: null });
        },
      });
      return;
    }
    onVote({ vote: { positions, pollId: id, id: voteId } }, method, info);
  }

  voteUp() {
    this.canVote([{ pos: 0, value: 1 }]);
  }

  voteDown() {
    this.canVote([{ pos: 1, value: 1 }]);
  }

  fetchVoters() {
    const { onFetchVoters, id } = this.props;
    onFetchVoters(id);
  }

  handleOptionSelection(data) {
    // const { multipleChoice } = this.props;
    const { pollOptions } = this.state;
    if (data) {
      const option = pollOptions[data.pos];
      this.canVote([{ pos: option.pos, value: option.checked ? 0 : 1 }]);
      // set all options to disabled
      /* this.setState(prevState => ({
          pollOptions: {
            ...prevState.pollOptions,
            [data.pos]: {
              ...prevState.pollOptions[data.pos],
              checked: !prevState.pollOptions[data.pos].checked,
            },
          },
        })); */
    }
  }

  renderVotingComponent() {
    const {
      updates,
      canVote,
      closedAt,
      ownVote,
      mode,
      extended,
      options,
      numVotes,
      followeeVotes,
      votes,
      threshold,
      allVoters,
    } = this.props;
    const { pollOptions, isExpanded } = this.state;
    if (extended) {
      return (
        <PollOptionsView
          canVote={canVote}
          closedAt={closedAt}
          onLoadVotes={this.fetchVoters}
          pollOptions={pollOptions}
          numVotes={numVotes}
          updates={updates}
          followeeVotes={followeeVotes}
          votes={votes}
          onChange={this.handleOptionSelection}
          options={options}
        />
      );
    }
    return (
      <VoteArea
        updates={updates}
        upvotes={options[0].numVotes}
        downvotes={!mode.unipolar ? options[1].numVotes : 0}
        unipolar={mode.unipolar}
        active={canVote && !closedAt}
        onUpvoteClick={this.voteUp}
        votersCount={allVoters}
        onDownvoteClick={this.voteDown}
        ownVote={ownVote}
        threshold={threshold}
        onClick={this.toggleVotersBox}
      >
        <div className={cn(s.votes, isExpanded && s.active)}>
          <div>
            {!isExpanded && (
              <Box between>
                <div className={s.followeeBlock}>
                  {this.getFolloweeVotes('pro')}
                </div>
                <div className={cn(s.followeeBlock, s.contra)}>
                  {this.getFolloweeVotes('con')}
                </div>
              </Box>
            )}
            {isExpanded && (
              <VotesList
                autoLoadVotes
                unipolar={mode.unipolar}
                votes={votes}
                isFetching={(updates && updates.isPending) || false}
                errorMessage={updates && updates.error}
                getVotes={this.fetchVoters}
              />
            )}
          </div>
        </div>
      </VoteArea>
    );
  }

  render() {
    const { closedAt } = this.props;
    const { confirmationFunc, voteError, isExpanded } = this.state;

    return (
      <div>
        {confirmationFunc && (
          <Layer>
            <Box column pad className={s.confirmationBox}>
              <Notification
                type="alert"
                message={<FormattedMessage {...messages.notify} />}
              />
              <Box justify>
                <Button onClick={() => confirmationFunc()} label="Ok" />
                <Button
                  primary
                  label={<FormattedMessage {...messages.cancel} />}
                  onClick={() => {
                    this.setState({ confirmationFunc: null });
                  }}
                />
              </Box>
            </Box>
          </Layer>
        )}
        {closedAt && (
          <p>
            <FormattedMessage {...messages.closed} />{' '}
            <FormattedRelative value={closedAt} />
          </p>
        )}
        {this.renderVotingComponent()}

        <Button
          label={isExpanded ? 'Hide votes' : 'Show votes'}
          plain
          onClick={this.toggleVotersBox}
        />

        {voteError && (
          <Notification
            type="error"
            message={<FormattedMessage {...messages.error} />}
          />
        )}
      </div>
    );
  }
}

export default withStyles(s)(Poll);
