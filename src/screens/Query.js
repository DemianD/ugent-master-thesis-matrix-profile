import React, { useState, useCallback } from 'react';

import { H1 } from '../components/Heading';
import Input from '../components/Input';
import Label from '../components/Label';
import Comunica from '../components/Comunica';
import Content from '../components/Content';

const Query = () => {
  const [execute, setExecute] = useState(false);
  const [datasource, setDatasource] = useState('http://fragments.dbpedia.org/2015/en');
  const [query, setQuery] = useState(
    'SELECT * WHERE { ?s ?p <http://dbpedia.org/resource/Belgium>. ?s ?p ?o } LIMIT 100'
  );

  const onDataCallback = useCallback(data => {
    console.log(data.toObject());
  }, []);

  const onEndCallback = useCallback(() => {
    setExecute(false);
  }, []);

  return (
    <>
      <H1 className="mt-8">Query</H1>
      <span>
        Query and visualize time series, powered by{' '}
        <a
          href="https://comunica.linkeddatafragments.org/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Comunica
        </a>
        .
      </span>
      <Content className="mt-10">
        <div className="max-w-md">
          <div className="mb-4">
            <Label htmlFor="datasource">Datasource</Label>
            <Input
              type="url"
              id="datasource"
              name="datasource"
              value={datasource}
              onChange={e => setDatasource(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="query">Query</Label>
            <Input
              type="editor"
              id="query"
              name="query"
              className="h-32"
              value={query}
              onChange={setQuery}
            />
          </div>
          <button onClick={() => setExecute(e => !e)}>{execute ? 'Stop' : 'Execute'}</button>
        </div>
        <Comunica
          execute={execute}
          datasource={datasource}
          query={query}
          onData={onDataCallback}
          onEnd={onEndCallback}
        />
      </Content>
    </>
  );
};

export default Query;
