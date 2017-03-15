import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './PollState.css';

class PollState extends React.Component {
  static propTypes = {
    allVoters: PropTypes.number,
    upvotes: PropTypes.number,
    downvotes: PropTypes.number,
    threshold: PropTypes.number,
    unipolar: PropTypes.bool,
    threshold_ref: PropTypes.string,
  }
  render() {
    let bgColor = 'red';
    if (this.props.threshold_ref !== 'voters' || this.props.upvotes === this.props.downvotes) {
      bgColor = 'yellow'; // this.props.downvotes < this.props.upvotes? 'green' : 'red';
    } else {
      bgColor = this.props.downvotes < this.props.upvotes
      ? 'green' : 'red';
    }

    return (
      <div
        className={s.root} style={{
          background: bgColor,
        }}
      >
        POLLSTATE
        <div>
          {this.props.unipolar ? 'VOTES' : 'UPVOTES'}: {this.props.upvotes}
          <br /> {!this.props.unipolar ? `DOWNVOTES :${this.props.downvotes}` : ''}
        </div>
      </div>
    );
  }
}

export default withStyles(s)(PollState);
