import React from 'react';

const url = 'https://query.linkeddatafragments.org/#';

const ComunicaLink = ({ datasource, query }) => {
  const href = `${url}datasources=${encodeURIComponent(datasource)}&query=${encodeURIComponent(
    query.trim()
  )}`;

  return (
    <span className="tracking-normal text-xs font-normal">
      <a href={href} target="_blank" rel="noopener noreferrer">
        query
      </a>
    </span>
  );
};

export default ComunicaLink;
