/* eslint-env jest */
import { executeInBatches } from './backgroundWorker';

function later(value, delay) {
  return new Promise(resolve => setTimeout(resolve, delay, value));
}

const fakeApiCall = async ({ data, time }) => {
  const res = await later(data, time);
  return res;
};

describe('BackgroundWorker', async () => {
  test('Promises should be executed', async () => {
    const testData = [
      { data: 1, time: 500 },
      { data: 2, time: 500 },
      { data: 3, time: 500 },
      { data: 4, time: 500 },
      { data: 5, time: 500 },
    ];

    const res = await executeInBatches(testData, fakeApiCall, 3);
    expect(res.length).toBe(testData.length);
  });
});
