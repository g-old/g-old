import { FormattedRelative } from 'react-intl';
import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Proposal.css';

class Proposal extends React.Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    state: PropTypes.string.isRequired,
    body: PropTypes.string.isRequired,
    publishedAt: PropTypes.string.isRequired,
  };
  render() {
    return (
      <div className={s.root}>
        <div className={s.container}>
          <div className={s.state}>
            {this.props.state}
          </div>
          <div className={s.headline}>
            {this.props.title}
          </div>
          <div className={s.date}>
            <FormattedRelative value={this.props.publishedAt} />
          </div>
          <div className={s.body} dangerouslySetInnerHTML={{ __html: this.props.body }} />
        </div>
      </div>
    );
  }
}

export default withStyles(s)(Proposal);
