import { useState, useEffect } from 'react';

import TreeQuery from '../query/TreeQuery';
import { useDebounce } from 'use-debounce';

const useTreeQuery = (initialDatasource, filters = [], execute = true, withMetadata = false) => {
  const [results, setResults] = useState([]);
  const [debouncedResults] = useDebounce(results, 1000);

  useEffect(() => {
    let ignore = false;
    let treeQuery = undefined;
    setResults([]);

    if (execute) {
      treeQuery = new TreeQuery(filters, withMetadata, (newResults) => {
        if (!ignore) {
          setResults((r) => r.concat(newResults));
        }
      });

      treeQuery.execute(initialDatasource);
    }

    return () => {
      treeQuery && treeQuery.cancel();
      ignore = true;
    };
  }, [execute, filters, initialDatasource, withMetadata]);

  return debouncedResults;
};

export default useTreeQuery;
