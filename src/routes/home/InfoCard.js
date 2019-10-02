/* @flow */
import React from 'react';
import withStyles from 'isomorphic-style-loader/withStyles';
import s from './InfoCard.css';
import Box from '../../components/Box';

type Props = { image?: string, title: string, content: string };

const InfoCard = ({ image, title, content }: Props) => {
  return (
    <Box>
      <div className={s.dettCard}>
        {image && (
          <div className={s.imgContainer}>
            <img src={image} alt="" />
          </div>
        )}

        <div>
          <h1>{title}</h1>
          <p>{content}</p>
        </div>
      </div>
    </Box>
  );
};

InfoCard.defaultProps = {
  image: null,
};

export default withStyles(s)(InfoCard);
