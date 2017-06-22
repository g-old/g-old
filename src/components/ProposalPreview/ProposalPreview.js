import { FormattedRelative } from 'react-intl';
import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './ProposalPreview.css';
import PollState from '../PollState';
import Link from '../Link';
import { getLastActivePoll } from '../../core/helpers';
// import { DOMParser } from 'xmldom';

class Proposal extends React.Component {
  static propTypes = {
    proposal: PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      state: PropTypes.string.isRequired,
      body: PropTypes.string.isRequired,
      publishedAt: PropTypes.string,
      pollOne: PropTypes.object,
      pollTwo: PropTypes.object,
      tags: PropTypes.arrayOf(PropTypes.object).isRequired,
    }).isRequired,
  };
  constructor(props) {
    super(props);
    this.state = { fullText: false };
  }

  render() {
    const poll = getLastActivePoll(this.props.proposal.state, this.props.proposal);
    const body = (
      <div>
        <div dangerouslySetInnerHTML={{ __html: this.props.proposal.body }} />
        <div className={s.overlay} />
      </div>
    );
    // null; /* eslint-disable jsx-a11y/no-static-element-interactions */
    // Disabled bc Nodejs Domparser (xmldom) has dep problems
    /*  if (this.state.fullText) {
      body = this.props.proposal.body;
    } else {
      body = `${new DOMParser()
        .parseFromString(this.props.proposal.body, 'text/html')
        .documentElement.textContent.substring(0, 100)}( ... )`;
        // `${this.props.proposal.body.substring(0, 100)} (...)`;
    } */ return (
      <div className={s.root}>
        <div className={s.container}>
          <div className={s.date}>
            <FormattedRelative value={this.props.proposal.publishedAt} />
          </div>
          <Link to={`/proposal/${this.props.proposal.id}/${poll.id}`}>
            <h2 className={s.header}>
              {this.props.proposal.title}
            </h2>

            <div className={s.body}>
              {body}
            </div>
            <div className={s.pollState}>
              <PollState
                compact
                allVoters={poll.allVoters}
                upvotes={poll.upvotes}
                downvotes={poll.downvotes}
                thresholdRef={poll.mode.thresholdRef}
                threshold={poll.threshold}
                unipolar={poll.mode.unipolar}
              />
            </div>
            <div className={s.tags}>
              {this.props.proposal.tags &&
                this.props.proposal.tags.map(tag =>
                  <span key={tag.id} className={s.tag}>{`${tag.text}`}</span>,
                )}
            </div>
          </Link>
        </div>

      </div>
    );
    /* eslint-enable jsx-a11y/no-static-element-interactions */
  }
}

export default withStyles(s)(Proposal);
