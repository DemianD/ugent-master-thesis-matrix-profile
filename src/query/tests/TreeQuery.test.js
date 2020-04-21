import TreeQuery, {
  GREATER_THAN,
  GREATER_THAN_OR_EQUAL_TO,
  LESS_THAN_OR_EQUAL_TO,
  LESS_THAN,
} from '../TreeQuery';
import { SOSA } from '../../utils/vocs';
import { mockFetch, waitForResults } from './utils';

describe('TreeQuery', () => {
  describe('one filter', () => {
    it('should fetch the right relations', async () => {
      const spy = mockFetch();
      const [wait, onData] = waitForResults(2);

      const treeQuery = new TreeQuery(
        [
          {
            relationType: GREATER_THAN_OR_EQUAL_TO,
            path: SOSA('resultTime'),
            value: new Date(Date.UTC(2020, 4 - 1, 17, 0, 0, 0, 0)),
          },
        ],
        onData
      );
      treeQuery.execute('https://www.example.com/');

      await wait;

      expect(spy.mock.calls.length).toBe(2);
      expect(spy.mock.calls[1][0]).toBe('https://www.example.com/2020-04-17T17:26:43.887Z');

      spy.mockRestore();
    });

    it.skip('should fetch the left relations', async () => {
      const spy = mockFetch();
      const [wait, onData] = waitForResults(3);

      const treeQuery = new TreeQuery(
        [
          {
            relationType: LESS_THAN_OR_EQUAL_TO,
            path: SOSA('resultTime'),
            value: new Date(Date.UTC(2020, 4 - 1, 15, 0, 0, 0, 0)),
          },
        ],
        onData
      );
      treeQuery.execute('https://www.example.com/');

      await wait;

      expect(spy.mock.calls.length).toBe(4);
      expect(spy.mock.calls[1][0]).toBe('https://www.example.com/2020-04-16T01:26:33.724Z');
      expect(spy.mock.calls[2][0]).toBe('https://www.example.com/2020-04-15T18:46:34.035Z');
      expect(spy.mock.calls[3][0]).toBe('https://www.example.com/2020-04-15T15:26:34.035Z');

      spy.mockRestore();
    });

    it.skip('fetch the pages zig zag', async () => {
      const spy = mockFetch();
      const [wait, onData] = waitForResults(2);

      const treeQuery = new TreeQuery(
        [
          {
            relationType: GREATER_THAN_OR_EQUAL_TO,
            path: SOSA('resultTime'),
            value: new Date(Date.UTC(2020, 4 - 1, 16, 9, 0, 0, 0)),
          },
        ],
        onData
      );
      treeQuery.execute('https://www.example.com/');

      await wait;

      expect(spy.mock.calls.length).toBe(3);
      expect(spy.mock.calls[1][0]).toBe('https://www.example.com/2020-04-16T01:26:33.724Z');
      expect(spy.mock.calls[2][0]).toBe('https://www.example.com/2020-04-16T08:06:38.540Z');

      spy.mockRestore();
    });
  });

  describe.skip('two filters (interval)', () => {
    it('fetches the correct pages', async () => {
      const spy = mockFetch();
      const [wait, onData] = waitForResults(4);

      const treeQuery = new TreeQuery(
        [
          {
            relationType: GREATER_THAN,
            path: SOSA('resultTime'),
            value: new Date(Date.UTC(2020, 4 - 1, 15, 18, 46, 34, 35)),
          },
          {
            relationType: LESS_THAN,
            path: SOSA('resultTime'),
            value: new Date(Date.UTC(2020, 4 - 1, 16, 1, 51, 33, 358)),
          },
        ],
        onData
      );

      treeQuery.execute('https://www.example.com/');

      await wait;

      expect(spy.mock.calls.length).toBe(4);
      expect(spy.mock.calls[1][0]).toBe('https://www.example.com/2020-04-16T01:26:33.724Z');
      expect(spy.mock.calls[2][0]).toBe('https://www.example.com/2020-04-15T18:46:34.035Z');
      expect(spy.mock.calls[3][0]).toBe('https://www.example.com/2020-04-15T22:06:33.680Z');

      spy.mockRestore();
    });

    it('fetches the correct pages 2', async () => {
      const spy = mockFetch();
      const [wait, onData] = waitForResults(4);

      const treeQuery = new TreeQuery(
        [
          {
            relationType: GREATER_THAN_OR_EQUAL_TO,
            path: SOSA('resultTime'),
            value: new Date(Date.UTC(2020, 4 - 1, 16, 14, 46, 43, 555)),
          },
          {
            relationType: LESS_THAN_OR_EQUAL_TO,
            path: SOSA('resultTime'),
            value: new Date(Date.UTC(2020, 4 - 1, 17, 17, 26, 0, 0)),
          },
        ],
        onData
      );
      treeQuery.execute('https://www.example.com/');

      await wait;

      expect(spy.mock.calls.length).toBe(4);
      expect(spy.mock.calls[1][0]).toBe('https://www.example.com/2020-04-16T01:26:33.724Z');
      expect(spy.mock.calls[2][0]).toBe('https://www.example.com/2020-04-17T17:26:43.887Z');
      expect(spy.mock.calls[3][0]).toBe('https://www.example.com/2020-04-16T08:06:38.540Z');

      spy.mockRestore();
    });
  });
});
