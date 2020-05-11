import React, { useState, useEffect } from 'react';
import ObservationLimitChart from './ObservationLimitChart';
import { MP } from '../utils/vocs';
import RadioButtonGroup from './RadioButtonGroup';
import RadioButton from './RadioButton';
import { H4 } from './Heading';

const mapSnippet = (snippet) => {
  return {
    subject: snippet.subject,
    size: snippet[MP('snippet_size').value].value,
    index: snippet[MP('index').value].value,
    fraction: parseFloat(snippet[MP('fraction').value].value),
    from: snippet[MP('from').value].value,
    to: snippet[MP('to').value].value,
  };
};

const formatFraction = (fraction) => {
  const result = fraction * 100;

  return `${result.toFixed(2)}%`;
};

const Snippets = ({ collectionSubject, snippets }) => {
  const [node, setNode] = useState();

  useEffect(() => {
    setNode(undefined);
  }, [snippets]);

  if (!snippets) {
    return null;
  }

  const nodes = snippets.reduce((acc, snippet) => {
    (acc[snippet.__meta.datasource] = acc[snippet.__meta.datasource] || []).push(
      mapSnippet(snippet)
    );

    return acc;
  }, {});

  return (
    <>
      <RadioButtonGroup className="mt-3" name="snippets" onChange={(n) => setNode(n)}>
        {Object.keys(nodes).map((node) => {
          const firstSnippet = nodes[node][0];
          return (
            <RadioButton key={node} value={node}>
              <span className="truncate font-tabular-nums">
                {firstSnippet.from} - {firstSnippet.to}
              </span>
            </RadioButton>
          );
        })}
      </RadioButtonGroup>
      {node && (
        <div className="mt-8 grid gap-10 grid-cols-2">
          {nodes[node]
            .sort((a, b) => b.fraction - a.fraction)
            .map(({ subject, size, index, fraction }) => (
              <div key={subject}>
                <H4>Snippet {formatFraction(fraction)}</H4>
                <ObservationLimitChart
                  collectionSubject={collectionSubject}
                  startDate={index}
                  limit={size}
                />
              </div>
            ))}
        </div>
      )}
    </>
  );
};

export default Snippets;
