/* @flow */
import React from 'react';
import {
  defineMessages,
  FormattedMessage,
  FormattedRelative,
} from 'react-intl';
import withStyles from 'isomorphic-style-loader/withStyles';
import s from './InfoCard.css';
import Box from '../../components/Box';

const messages = defineMessages({
  endTime: {
    id: 'poll.endtime',
    defaultMessage: 'Voting ends {time}',
    descriptions: 'Endtime label on cards',
  },
});

type Props = {
  image?: string,
  title: string,
  content: string,
  poll: PollShape,
  onClick: () => void,
};

const InfoCard = ({ image, title, content, poll, onClick }: Props) => {
  return (
    <Box onClick={onClick}>
      <Box align column className={s.dettCard}>
        {image && (
          <div className={s.imgContainer}>
            <img src={image} alt="" />
          </div>
        )}
        <div>
          <FormattedMessage
            {...messages.endTime}
            values={{ time: <FormattedRelative value={poll.endTime} /> }}
          />
          <h2>{title}</h2>
          <p>{content}</p>
        </div>
        <Box>
          <div>
            <svg viewBox="0 0 24 24" width="16px" height="16px" role="img">
              <path
                fill="none"
                stroke="#666"
                stroke-width="2"
                d="M12,2 L12,22 M3,11 L12,2 L21,11"
              ></path>
            </svg>
            {poll.options[0].numVotes}
          </div>
          <div>
            <svg viewBox="0 0 24 24" width="16px" height="16px" role="img">
              <path
                fill="none"
                stroke="#666"
                stroke-width="2"
                d="M12,2 L12,22 M3,11 L12,2 L21,11"
                transform="matrix(1 0 0 -1 0 24)"
              ></path>
            </svg>
            {poll.options[1].numVotes}
          </div>
        </Box>
      </Box>
    </Box>
  );
};

InfoCard.defaultProps = {
  image: null,
};

export default withStyles(s)(InfoCard);
