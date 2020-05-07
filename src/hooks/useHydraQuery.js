import { useState, useEffect } from 'react';

import HydraQuery from '../query/HydraQuery';
import { useDebounce } from 'use-debounce';

const useHydraQuery = (
  initialDatasource,
  filters = [],
  execute = true,
  limit,
  withMetadata = false
) => {
  const [results, setResults] = useState([]);
  const [debouncedResults] = useDebounce(results, 1000);

  useEffect(() => {
    let ignore = false;
    let hydraQuery = undefined;
    setResults([]);

    if (execute) {
      hydraQuery = new HydraQuery(filters, withMetadata, (newResults) => {
        if (!ignore) {
          setResults((r) => {
            const newR = r.concat(newResults);

            if (r.length >= limit) {
              hydraQuery.cancel();

              return newR.slice(0, limit);
            }

            return newR;
          });
        }
      });

      hydraQuery.execute(initialDatasource);
    }

    return () => {
      hydraQuery && hydraQuery.cancel();
      ignore = true;
    };
  }, [execute, filters, initialDatasource, limit, withMetadata]);

  return debouncedResults;
};

export default useHydraQuery;
