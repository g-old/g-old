import React, { PropTypes } from 'react';

class VotesList extends React.Component {
  static propTypes = {
    votes: PropTypes.arrayOf(PropTypes.object),
    getVotes: PropTypes.func.isRequired,
  };
  render() {
    return (
      <div>
        <button onClick={this.props.getVotes}> GETVOTES</button>
        {this.props.votes &&
          this.props.votes.map(votes => (
            <p>{votes.id} {votes.voter.name} {votes.voter.surname} {votes.position}</p>
          ))}
      </div>
    );
  }
}

export default VotesList;
