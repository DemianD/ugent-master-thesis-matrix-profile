import TreeQuery from '../TreeQuery';
import { GREATER_THAN, GREATER_THAN_OR_EQUAL_TO, LESS_THAN_OR_EQUAL_TO, LESS_THAN } from '../Query';

import { SOSA } from '../../utils/vocs';
import { mockRequests, waitForResults } from './utils';

const createTreeQuery = (waitForNumberOfResults, relationOrRelations) => {
  const [getCalls, restore] = mockRequests();
  const [wait, onData, getResults] = waitForResults(waitForNumberOfResults);

  const treeQuery = new TreeQuery(
    Array.isArray(relationOrRelations) ? relationOrRelations : [relationOrRelations],
    false,
    onData
  );

  treeQuery.execute('https://example.com/');

  return [
    getCalls,
    () =>
      getResults()
        .flat()
        .map((r) => r[SOSA('resultTime').value].value)
        .sort(),
    restore,
    wait,
  ];
};

describe('TreeQuery', () => {
  describe('one filter', () => {
    it('should fetch the fragments on the most right path', async () => {
      const [getCalls, getResults, restore, wait] = createTreeQuery(4, {
        relationType: GREATER_THAN_OR_EQUAL_TO,
        path: SOSA('resultTime'),
        value: new Date(Date.UTC(2020, 5 - 1, 1, 17, 20, 0, 0)),
      });

      await wait;

      const calls = getCalls();

      expect(calls.length).toBe(4);
      expect(calls[0]).toBe('/');
      expect(calls[1]).toBe('/node/15887724979917');
      expect(calls[2]).toBe('/node/15887724979856');
      expect(calls[3]).toBe('/2020-05-01T17:20:00.000Z');

      expect(getResults()).toEqual([
        '2020-05-01T17:20:00.000Z',
        '2020-05-01T17:21:00.000Z',
        '2020-05-01T17:22:00.000Z',
        '2020-05-01T17:23:00.000Z',
        '2020-05-01T17:24:00.000Z',
      ]);

      restore();
    });

    it('should fetch the fragments on the most left path', async () => {
      const [getCalls, getResults, restore, wait] = createTreeQuery(4, {
        relationType: LESS_THAN_OR_EQUAL_TO,
        path: SOSA('resultTime'),
        value: new Date(Date.UTC(2020, 5 - 1, 1, 16, 4, 0, 0)),
      });

      await wait;

      const calls = getCalls();

      expect(calls.length).toBe(4);
      expect(calls[0]).toBe('/');
      expect(calls[1]).toBe('/node/15887724979918');
      expect(calls[2]).toBe('/node/15887721988392');
      expect(calls[3]).toBe('/2020-05-01T16:01:00.000Z');

      expect(getResults()).toEqual([
        '2020-05-01T16:01:00.000Z',
        '2020-05-01T16:02:00.000Z',
        '2020-05-01T16:03:00.000Z',
        '2020-05-01T16:04:00.000Z',
      ]);

      restore();
    });

    it('should fetch fragments on zig zag way', async () => {
      const [getCalls, getResults, restore, wait] = createTreeQuery(4, {
        relationType: GREATER_THAN_OR_EQUAL_TO,
        path: SOSA('resultTime'),
        value: new Date(Date.UTC(2020, 5 - 1, 1, 16, 44, 0, 0)),
      });

      await wait;

      const calls = getCalls();

      expect(calls.length).toBe(4);
      expect(calls[0]).toBe('/');
      expect(calls[1]).toBe('/node/15887724979918');
      expect(calls[2]).toBe('/node/15887722729763');
      expect(calls[3]).toBe('/2020-05-01T16:40:00.000Z');

      expect(getResults()).toEqual(['2020-05-01T16:44:00.000Z']);

      restore();
    });
  });

  describe('two filters (interval)', () => {
    it('should fetch the interval in the middle of the tree', async () => {
      const [getCalls, getResults, restore, wait] = createTreeQuery(8, [
        {
          relationType: GREATER_THAN,
          path: SOSA('resultTime'),
          value: new Date(Date.UTC(2020, 5 - 1, 1, 16, 42, 0, 0)),
        },
        {
          relationType: LESS_THAN,
          path: SOSA('resultTime'),
          value: new Date(Date.UTC(2020, 5 - 1, 1, 16, 53, 0, 0)),
        },
      ]);

      await wait;

      const calls = getCalls().sort();

      expect(calls.length).toBe(8);
      expect(calls[0]).toBe('/');
      expect(calls[1]).toBe('/2020-05-01T16:40:00.000Z');
      expect(calls[2]).toBe('/2020-05-01T16:45:00.000Z');
      expect(calls[3]).toBe('/2020-05-01T16:50:00.000Z');
      expect(calls[4]).toBe('/node/15887722729763');
      expect(calls[5]).toBe('/node/15887723478524');
      expect(calls[6]).toBe('/node/15887724979917');
      expect(calls[7]).toBe('/node/15887724979918');

      expect(getResults()).toEqual([
        '2020-05-01T16:43:00.000Z',
        '2020-05-01T16:44:00.000Z',
        '2020-05-01T16:45:00.000Z',
        '2020-05-01T16:46:00.000Z',
        '2020-05-01T16:47:00.000Z',
        '2020-05-01T16:48:00.000Z',
        '2020-05-01T16:49:00.000Z',
        '2020-05-01T16:50:00.000Z',
        '2020-05-01T16:51:00.000Z',
        '2020-05-01T16:52:00.000Z',
      ]);

      restore();
    });

    it('should fetch the interval at the right side', async () => {
      const [getCalls, getResults, restore, wait] = createTreeQuery(5, [
        {
          relationType: GREATER_THAN_OR_EQUAL_TO,
          path: SOSA('resultTime'),
          value: new Date(Date.UTC(2020, 5 - 1, 1, 17, 16, 0, 0)),
        },
        {
          relationType: LESS_THAN_OR_EQUAL_TO,
          path: SOSA('resultTime'),
          value: new Date(Date.UTC(2020, 6 - 1, 1, 16, 53, 0, 0)),
        },
      ]);
      await wait;

      const calls = getCalls().sort();

      expect(calls.length).toBe(5);
      expect(calls[0]).toBe('/');
      expect(calls[1]).toBe('/2020-05-01T17:15:00.000Z');
      expect(calls[2]).toBe('/2020-05-01T17:20:00.000Z');
      expect(calls[3]).toBe('/node/15887724979856');
      expect(calls[4]).toBe('/node/15887724979917');

      expect(getResults()).toEqual([
        '2020-05-01T17:16:00.000Z',
        '2020-05-01T17:17:00.000Z',
        '2020-05-01T17:18:00.000Z',
        '2020-05-01T17:19:00.000Z',
        '2020-05-01T17:20:00.000Z',
        '2020-05-01T17:21:00.000Z',
        '2020-05-01T17:22:00.000Z',
        '2020-05-01T17:23:00.000Z',
        '2020-05-01T17:24:00.000Z',
      ]);

      restore();
    });

    it('should fetch the interval at the left side', async () => {
      const [getCalls, getResults, restore, wait] = createTreeQuery(5, [
        {
          relationType: GREATER_THAN_OR_EQUAL_TO,
          path: SOSA('resultTime'),
          value: new Date(Date.UTC(2020, 4 - 1, 1, 17, 16, 0, 0)),
        },
        {
          relationType: LESS_THAN,
          path: SOSA('resultTime'),
          value: new Date(Date.UTC(2020, 5 - 1, 1, 16, 6, 0, 0)),
        },
      ]);
      await wait;

      const calls = getCalls().sort();

      expect(calls.length).toBe(5);
      expect(calls[0]).toBe('/');
      expect(calls[1]).toBe('/2020-05-01T16:01:00.000Z');
      expect(calls[2]).toBe('/2020-05-01T16:05:00.000Z');
      expect(calls[3]).toBe('/node/15887721988392');
      expect(calls[4]).toBe('/node/15887724979918');

      expect(getResults()).toEqual([
        '2020-05-01T16:01:00.000Z',
        '2020-05-01T16:02:00.000Z',
        '2020-05-01T16:03:00.000Z',
        '2020-05-01T16:04:00.000Z',
        '2020-05-01T16:05:00.000Z',
      ]);

      restore();
    });
  });
});
