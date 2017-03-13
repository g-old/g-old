import React, { PropTypes } from 'react';

class PollState extends React.Component {
  static propTypes ={
    allVoters: PropTypes.number,
    upvotes: PropTypes.number,
    downvotes: PropTypes.number,
    threshold: PropTypes.number,
    threshold_ref: PropTypes.string,
  }
  render() {
    let bgColor = 'red';
    console.log(this.props.threshold_ref);
    // eslint-disable-next-line eqeqeq
    if (this.props.threshold_ref == 'voters') {
      bgColor = this.props.downvotes < this.props.upvotes ? 'green' : 'red';
    } else {
      bgColor = 'yellow'; // this.props.downvotes < this.props.upvotes? 'green' : 'red';
    }

    return (
      <div style={{ background: bgColor }}>
        POLLSTATE
        <div>
          UPVOTES: {this.props.upvotes}
          <br />
          {this.props.downvotes && `DOWNVOTES :${this.props.downvotes}`}
        </div>
      </div>
    );
  }
}

export default PollState;
