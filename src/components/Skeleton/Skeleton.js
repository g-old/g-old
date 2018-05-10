import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Skeleton.css';

const Skeleton = props => {
  const elements = [];
  const countTo = props.count || 1;
  for (let i = 0; i < countTo; i += 1) {
    elements.push(<span key={i} className={s.root} />);
  }

  const Wrapper = props.wrapper;
  return (
    <span>
      {Wrapper // eslint-disable-next-line
        ? elements.map((element, i) => <Wrapper key={i}>{element}</Wrapper>)
        : elements}
    </span>
  );
};

Skeleton.propTypes = {
  count: PropTypes.number,
  wrapper: PropTypes.element,
};
Skeleton.defaultProps = {
  count: null,
  wrapper: null,
};

export default withStyles(s)(Skeleton);
