import { useEffect } from 'react';
import { newEngine } from '@comunica/actor-init-sparql';

let engine = newEngine();

const Comunica = ({ execute, datasource, query, onData, onEnd }) => {
  useEffect(() => {
    let iterator;
    let ignore = false;

    if (execute) {
      engine
        .query(query, {
          sources: [datasource]
        })
        .then(comunicaResult => {
          if (!ignore) {
            iterator = comunicaResult.bindingsStream;

            iterator.on('data', data => onData(data));
            iterator.on('end', () => onEnd());
          } else {
            comunicaResult.bindingsStream.destroy();
          }
        });
    }

    return () => {
      ignore = true;
      iterator && iterator.destroy();
    };
  }, [execute, datasource, query, onData, onEnd]);

  return null;
};

Comunica.defaultProps = {
  onData: () => {},
  onEnd: () => {}
};

export default Comunica;
