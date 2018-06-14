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
