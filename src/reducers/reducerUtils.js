/* eslint-disable import/prefer-default-export */
export const sortByWorkTeam = (state, data, key) =>
  Object.keys(data).reduce((acc, curr) => {
    const resource = data[curr];
    const id = resource[key];
    if (!id) return acc;

    if (acc[id]) {
      acc[id] = [...new Set([...acc[id], resource.id])];
    } else {
      acc[id] = [resource.id];
    }

    return acc;
  }, state);
