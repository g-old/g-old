import React from 'react';
import PropTypes from 'prop-types';
import Box from '../Box';
import Proposal from '../Proposal';
import Poll from '../Poll';
import Statement from '../Statement';

import { concatDateAndTime, utcCorrectedDate } from '../../core/helpers';

const validate = (name, data) => {
  let validated = data && data.trim();
  if (!validated) {
    validated = `${name} is missing!`;
  } else if (validated.length < 3) {
    validated = `${name} is too short!`;
  }
  return validated;
};

const InputPreview = ({
  state,
  title,
  body,
  spokesman,
  user,
  threshold,
  thresholdRef,
  unipolar,
  withStatements,
  options,
  dateTo,
  timeTo,
  pollOnly,
}) => {
  const date = dateTo || utcCorrectedDate(3).slice(0, 10);
  const time = timeTo || utcCorrectedDate().slice(11, 16);
  const fakeVote = { id: 1, positions: [{ pos: 0, value: 1 }] };
  const endTime = concatDateAndTime(date, time);
  return (
    <Box column>
      {!pollOnly && (
        <Proposal
          id="0000"
          state={state}
          publishedAt={new Date()}
          title={validate('Title', title)}
          body={validate('Body', body)}
          spokesman={spokesman}
        />
      )}
      <Poll
        extended={state === 'survey' && options.length > 1}
        endTime={endTime}
        onFetchVoters={() => {}}
        options={
          options.length
            ? options
            : [
                {
                  id: 0,
                  order: 0,
                  description: { _default: 'up' },
                  numVotes: 0,
                },
                {
                  id: 0,
                  order: 0,
                  description: { _default: 'down' },
                  numVotes: 0,
                },
              ]
        }
        threshold={threshold}
        updates={{}}
        canVote
        onVote={() => {}}
        mode={{ withStatements, unipolar, thresholdRef }}
      />
      {withStatements && (
        <Box>
          <Statement
            onCreate={() => {}}
            vote={fakeVote}
            author={user || spokesman}
            asInput
          />
        </Box>
      )}
    </Box>
  );
};

InputPreview.propTypes = {
  state: PropTypes.oneOf(['proposed', 'survey']).isRequired,
  title: PropTypes.string.isRequired,
  body: PropTypes.string.isRequired,
  spokesman: PropTypes.shape({}).isRequired,
  user: PropTypes.shape({}).isRequired,
  threshold: PropTypes.number.isRequired,
  thresholdRef: PropTypes.string.isRequired,
  unipolar: PropTypes.bool.isRequired,
  withStatements: PropTypes.bool.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  dateTo: PropTypes.string,
  timeTo: PropTypes.string,
  pollOnly: PropTypes.bool.isRequired,
};
InputPreview.defaultProps = {
  dateTo: null,
  timeTo: null,
};
export default InputPreview;
