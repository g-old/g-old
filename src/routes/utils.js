/* eslint-disable import/prefer-default-export */

export const createRedirectLink = (path, query) => {
  const redirect = `/?redirect=${path}`;
  if (query) {
    return Object.keys(query).reduce((link, param) => {
      const value = query[param];
      if (value) {
        // only if value is set
        // eslint-disable-next-line no-param-reassign
        link += `&${param}=${value}`;
      }
      return link;
    }, redirect);
  }

  return redirect;
};

export const sortActiveProposals = (a, b) => {
  const timeA = new Date(
    a.state === 'proposed' ? (a.pollOne ? a.pollOne.endTime : 0) : (a.pollTwo ? a.pollTwo.endTime : 0),
  );

  const timeB = new Date(
    b.state === 'proposed' ? (b.pollOne ? b.pollOne.endTime : 0) : (b.pollTwo ? b.pollTwo.endTime : 0),
  );
  return timeA - timeB;
};
export const sortClosedProposals = (a, b) => {
  let timeA;
  let timeB;
  if (a.pollTwo) {
    timeA = new Date(a.pollTwo.closedAt);
  } else {
    timeA = new Date(a.pollOne.closedAt);
  }
  if (b.pollTwo) {
    timeB = new Date(b.pollTwo.closedAt);
  } else {
    timeB = new Date(b.pollOne.closedAt);
  }
  return timeB - timeA;
};

export const surveyStateFilter = (survey, filter) => {
  if (filter === 'active') {
    return survey.pollOne && !survey.pollOne.closedAt;
  }
  return survey.pollOne && survey.pollOne.closedAt;
};
