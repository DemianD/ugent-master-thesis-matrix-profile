import { useState, useEffect } from 'react';

import TreeQuery from '../query/tree';

const useTreeQuery = (datasource, query, f = [], execute = true) => {
  const [results, setResults] = useState([]);

  useEffect(() => {
    let ignore = false;
    let treeQuery = undefined;

    if (execute) {
      treeQuery = new TreeQuery(query, f, (newResults) => {
        if (!ignore) {
          setResults((r) => r.concat(newResults));
        }
      });

      treeQuery.execute(datasource);
    }

    return () => {
      treeQuery && treeQuery.cancel();
      ignore = true;
    };
  }, [datasource, execute, f, query]);

  return results;
};

export default useTreeQuery;
