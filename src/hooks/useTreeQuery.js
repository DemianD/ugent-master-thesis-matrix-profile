import { useState, useEffect } from 'react';

import TreeQuery from '../query/TreeQuery';

const useTreeQuery = (initialDatasource, filters = [], execute = true) => {
  const [results, setResults] = useState([]);

  useEffect(() => {
    let ignore = false;
    let treeQuery = undefined;
    setResults([]);

    if (execute) {
      treeQuery = new TreeQuery(filters, (newResults) => {
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
  }, [execute, filters, initialDatasource]);

  return results;
};

export default useTreeQuery;
