import React from 'react';

const ExternalLink = ({ href, children }) => {
  return (
    <a className="font-medium italic" href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
};

export default ExternalLink;
