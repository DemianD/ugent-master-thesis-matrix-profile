import React from 'react';
import c from '../utils/c';

const Content = ({ className, children }) => {
  return <div className={c('w-full max-w-4xl', className)}>{children}</div>;
};

export default Content;
