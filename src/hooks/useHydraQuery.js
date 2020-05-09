import { useState, useEffect } from 'react';

import HydraQuery from '../query/HydraQuery';
import { useDebounce } from 'use-debounce';

const useHydraQuery = (initialDatasource, filters, execute = true, limit, withMetadata = false) => {
  const [results, setResults] = useState({});
  const [debouncedResults] = useDebounce(results, 1000);

  useEffect(() => {
    let ignore = false;
    let hydraQuery = undefined;
    setResults({});

    if (execute) {
      hydraQuery = new HydraQuery(filters || [], withMetadata, (event, newResults) => {
        if (!ignore) {
          setResults((r) => {
            const newR = (r[event] || []).concat(newResults);

            if (newR.length >= limit) {
              hydraQuery.cancel();
            }

            return {
              ...r,
              [event]: newR.length >= limit ? newR.slice(0, limit) : newR,
            };
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
