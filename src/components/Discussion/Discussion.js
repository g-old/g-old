import { FormattedRelative } from 'react-intl';
import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Discussion.css';

class Discussion extends React.Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    state: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    publishedAt: PropTypes.string.isRequired,
    spokesman: PropTypes.shape({
      thumbnail: PropTypes.string,
      name: PropTypes.string,
      surname: PropTypes.string,
    }),
  };
  static defaultProps = {
    spokesman: null,
  };
  render() {
    return (
      <div className={s.root}>
        <div className={s.container}>
          <div className={s.state}>{this.props.state}</div>
          <div className={s.headline}>{this.props.title}</div>
          <div className={s.date}>
            <FormattedRelative value={this.props.publishedAt} />
          </div>
          <div
            className={s.body}
            dangerouslySetInnerHTML={{ __html: this.props.content }}
          />
          {this.props.spokesman && (
            <span>
              {'Spokesman: '}
              <img
                className={s.avatar}
                src={this.props.spokesman.thumbnail}
                alt="IMG"
              />
              {`${this.props.spokesman.name} ${this.props.spokesman.surname}`}
            </span>
          )}
        </div>
      </div>
    );
  }
}

export default withStyles(s)(Discussion);
