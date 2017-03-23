// eslint-disable-next-line import/prefer-default-export
export const thresholdPassed = poll =>
   poll.upvotes > Math.floor((poll.allVoters / 100) * poll.threshold);
