import { useState, useEffect } from 'react';
import { newEngine } from '@comunica/actor-init-sparql';

let engine = newEngine();

const useComunica = (datasources, query, execute) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    let iterator;
    let ignore = false;

    if (execute) {
      engine
        .query(query, {
          sources: Array.isArray(datasources) ? datasources : [datasources],
        })
        .then((comunicaResult) => {
          if (!ignore) {
            iterator = comunicaResult.bindingsStream;

            iterator.on('data', (data) => {
              setData((d) => [...d, data]);
            });
          } else {
            comunicaResult.bindingsStream.destroy();
          }
        });
    }

    return () => {
      ignore = true;
      iterator && iterator.destroy();
    };
  }, [datasources, execute, query]);

  return [data];
};

export default useComunica;
